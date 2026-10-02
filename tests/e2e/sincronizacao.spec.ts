/**
 * Testes de ponta a ponta — os dois cenários que importam para a família:
 *
 *  1. TEMPO REAL: adicionar no aparelho A aparece no aparelho B em menos de 2 s.
 *  2. OFFLINE: os dois ficam offline, cada um adiciona, reconectam — e nada
 *     se duplica nem se perde.
 *
 * Como rodar:
 *   Terminal 1:  npm run emulators
 *   Terminal 2:  npm run test:e2e
 *
 * O build usado aqui aponta para o emulador (veja `.env.e2e` e o script
 * `pretest:e2e` no package.json).
 */
import { test, expect, type BrowserContext, type Page } from '@playwright/test';

/**
 * Id do projeto usado nos emuladores (precisa bater com o `.env.e2e`).
 */
const PROJETO = process.env.E2E_PROJECT_ID ?? 'lista-mercado-regras';
const EMULADOR_FIRESTORE = process.env.E2E_FIRESTORE_EMULATOR ?? '127.0.0.1:8080';
const EMULADOR_AUTH = process.env.E2E_AUTH_EMULATOR ?? '127.0.0.1:9099';

/**
 * Zera os emuladores antes de cada teste.
 *
 * Sem isto, os documentos e os usuários anônimos de um teste ficam para o
 * seguinte. Em uma suíte inteira o emulador acumula estado suficiente para as
 * escritas começarem a demorar, e os testes falham por tempo esgotado — sem
 * nenhum problema real no app. Limpar deixa cada teste determinístico.
 */
test.beforeEach(async () => {
  await Promise.all([
    fetch(
      `http://${EMULADOR_FIRESTORE}/emulator/v1/projects/${PROJETO}/databases/(default)/documents`,
      { method: 'DELETE' },
    ),
    fetch(`http://${EMULADOR_AUTH}/emulator/v1/projects/${PROJETO}/accounts`, {
      method: 'DELETE',
    }),
  ]).catch(() => {
    // Sem emulador acessível, os próprios testes falham logo adiante com uma
    // mensagem melhor do que a daqui.
  });
});

/** Dois contextos = dois "aparelhos" com armazenamento e rede independentes. */
async function abrirAparelho(
  contexto: BrowserContext,
  listId?: string,
): Promise<Page> {
  const pagina = await contexto.newPage();
  // Erros do app aparecem no log do teste — sem isto, uma falha de escrita no
  // Firestore vira apenas "tempo esgotado" e esconde o motivo.
  pagina.on('pageerror', (erro) => console.log('[erro na página]', erro.message));
  pagina.on('console', (msg) => {
    if (msg.type() === 'error' && !/ERR_CERT|Failed to load resource/.test(msg.text())) {
      console.log('[console do app]', msg.text());
    }
  });
  await pagina.goto(listId ? `/?l=${listId}` : '/');
  return pagina;
}

/**
 * Espera o service worker ASSUMIR O CONTROLE da página.
 *
 * O app usa `registerType: 'prompt'` com `skipWaiting`/`clientsClaim`
 * desligados — de propósito, para não recarregar o app embaixo do dedo de quem
 * está comprando. A consequência é que, na PRIMEIRA visita, o service worker
 * instala mas não controla a página já carregada: só a próxima navegação passa
 * por ele. Sem esperar por isso, abrir o app offline dá
 * ERR_INTERNET_DISCONNECTED, porque não há ninguém para servir o HTML.
 */
async function aguardarServiceWorker(pagina: Page): Promise<void> {
  await pagina.waitForFunction(
    () => 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null,
    undefined,
    { timeout: 30_000 },
  ).catch(async () => {
    // Em alguns casos é preciso uma navegação a mais para o SW tomar o controle.
    await pagina.reload();
    await pagina.waitForFunction(
      () => 'serviceWorker' in navigator && navigator.serviceWorker.controller !== null,
      undefined,
      { timeout: 30_000 },
    );
  });
}

/** Cria a lista inicial e devolve o id que foi para a URL. */
async function criarLista(pagina: Page, nome = 'Mercado E2E'): Promise<string> {
  await pagina.getByLabel('Nome da lista').fill(nome);
  await pagina.getByRole('button', { name: 'Criar nova lista' }).click();

  // O id só vai para a URL depois de o SERVIDOR confirmar a criação, então
  // esta espera depende da rede/emulador.
  //
  // Precisa ser POLLING: o app troca a URL com history.pushState, que não é uma
  // navegação — `waitForURL` ficaria esperando um evento de load que nunca vem.
  // E conferimos o toast de erro a cada volta, para que uma falha real apareça
  // com o motivo em vez de só esgotar o tempo.
  const erroDoApp = pagina.getByText(/Não consegui criar a lista|Algo deu errado/);
  const limite = Date.now() + 45_000;
  while (Date.now() < limite) {
    if (/\?l=[A-Za-z0-9]{20,40}/.test(pagina.url())) break;
    if (await erroDoApp.isVisible().catch(() => false)) {
      throw new Error(`O app não conseguiu criar a lista: "${await erroDoApp.innerText()}"`);
    }
    await pagina.waitForTimeout(200);
  }
  await expect(pagina).toHaveURL(/\?l=[A-Za-z0-9]{20,40}/, { timeout: 5000 });
  const url = new URL(pagina.url());
  const id = url.searchParams.get('l');
  if (!id) throw new Error('A lista foi criada sem id na URL.');
  return id;
}

/** Busca um produto e adiciona pelo atalho "+", sem abrir o sheet. */
async function adicionarPelaBusca(pagina: Page, texto: string, nomeExato: string): Promise<void> {
  const busca = pagina.getByRole('searchbox', { name: 'Buscar produto' });
  await busca.fill(texto);
  // `exact` é obrigatório aqui: "Tomate" casaria também com "Tomate cereja",
  // "Tomate italiano", "Tomate seco"… e o seletor ficaria ambíguo.
  const botaoMais = pagina.getByRole('button', {
    name: `Adicionar direto: ${nomeExato}`,
    exact: true,
  });
  await expect(botaoMais).toBeVisible({ timeout: 15_000 });
  await botaoMais.click();
  await busca.fill('');
}

/**
 * A quantidade aparece como "2" + <span>un</span>, então o textContent fica
 * "2un" (sem espaço). O \s* do regex cobre as duas formas.
 */
function quantidadeDoItem(pagina: Page, nome: string, texto: RegExp) {
  return pagina
    .getByRole('main')
    .locator('li')
    .getByText(nome, { exact: true })
    .locator('xpath=ancestor::li[1]')
    .getByText(texto);
}

/**
 * O item na lista propriamente dita.
 *
 * O escopo em `li` é necessário: os chips de "Comprados com frequência" também
 * ficam dentro do <main> e trazem o mesmo nome, então um seletor mais largo
 * acusaria o item como presente depois de ele já ter saído da lista.
 */
function itemNaLista(pagina: Page, nome: string) {
  return pagina.getByRole('main').locator('li').getByText(nome, { exact: true });
}

test.describe('sincronização em tempo real', () => {
  test('item adicionado no aparelho A aparece no B em menos de 2 s', async ({ browser }) => {
    const contextoA = await browser.newContext();
    const contextoB = await browser.newContext();

    try {
      const aparelhoA = await abrirAparelho(contextoA);
      const listId = await criarLista(aparelhoA);

      // O aparelho B entra na MESMA lista, só pelo link.
      const aparelhoB = await abrirAparelho(contextoB, listId);
      await expect(aparelhoB.getByRole('heading', { name: 'Mercado E2E' })).toBeVisible({
        timeout: 20_000,
      });

      await adicionarPelaBusca(aparelhoA, 'leite integral', 'Leite integral');
      await expect(itemNaLista(aparelhoA, 'Leite integral')).toBeVisible();

      // O onSnapshot do B tem de trazer isso sozinho, sem recarregar a página.
      await expect(itemNaLista(aparelhoB, 'Leite integral')).toBeVisible({ timeout: 2000 });
    } finally {
      await contextoA.close();
      await contextoB.close();
    }
  });

  test('marcar como comprado no B reflete no A', async ({ browser }) => {
    const contextoA = await browser.newContext();
    const contextoB = await browser.newContext();

    try {
      const aparelhoA = await abrirAparelho(contextoA);
      const listId = await criarLista(aparelhoA);
      await adicionarPelaBusca(aparelhoA, 'arroz branco', 'Arroz branco');

      const aparelhoB = await abrirAparelho(contextoB, listId);
      await expect(itemNaLista(aparelhoB, 'Arroz branco')).toBeVisible({ timeout: 20_000 });

      await aparelhoB
        .getByRole('checkbox', { name: 'Marcar como comprado: Arroz branco' })
        .click();

      // No A, o item passa para "No carrinho".
      await expect(
        aparelhoA.getByRole('button', { name: /No carrinho/ }),
      ).toBeVisible({ timeout: 5000 });
    } finally {
      await contextoA.close();
      await contextoB.close();
    }
  });
});

test.describe('cenário offline', () => {
  test('dois aparelhos offline adicionam o MESMO produto e reconectam sem duplicar', async ({
    browser,
  }) => {
    const contextoA = await browser.newContext();
    const contextoB = await browser.newContext();

    try {
      // --- Preparo: lista criada online, os dois aparelhos com ela em cache ---
      const aparelhoA = await abrirAparelho(contextoA);
      const listId = await criarLista(aparelhoA);

      const aparelhoB = await abrirAparelho(contextoB, listId);
      await expect(aparelhoB.getByRole('heading', { name: 'Mercado E2E' })).toBeVisible({
        timeout: 20_000,
      });

      // O catálogo precisa estar carregado nos dois ANTES de cortar a rede.
      await adicionarPelaBusca(aparelhoA, 'arroz branco', 'Arroz branco');
      await expect(itemNaLista(aparelhoB, 'Arroz branco')).toBeVisible({ timeout: 10_000 });
      await adicionarPelaBusca(aparelhoB, 'arroz branco', 'Arroz branco');

      // --- Agora os dois ficam offline ---
      await contextoA.setOffline(true);
      await contextoB.setOffline(true);

      // Cada um adiciona "Leite integral" sem saber do outro.
      await adicionarPelaBusca(aparelhoA, 'leite integral', 'Leite integral');
      await adicionarPelaBusca(aparelhoB, 'leite integral', 'Leite integral');

      // Offline, cada um vê o próprio item (vindo do cache local).
      await expect(itemNaLista(aparelhoA, 'Leite integral')).toBeVisible();
      await expect(itemNaLista(aparelhoB, 'Leite integral')).toBeVisible();

      // E um item diferente em cada um, para checar que nada se perde.
      await adicionarPelaBusca(aparelhoA, 'tomate', 'Tomate');
      await adicionarPelaBusca(aparelhoB, 'cenoura', 'Cenoura');

      // --- Reconectam ---
      await contextoA.setOffline(false);
      await contextoB.setOffline(false);

      // O Firestore sincroniza sozinho, sem ação do usuário.
      // Nada se perdeu: cada aparelho vê o que o outro adicionou.
      for (const pagina of [aparelhoA, aparelhoB]) {
        await expect(itemNaLista(pagina, 'Tomate')).toBeVisible({ timeout: 20_000 });
        await expect(itemNaLista(pagina, 'Cenoura')).toBeVisible({ timeout: 20_000 });
        await expect(itemNaLista(pagina, 'Leite integral')).toBeVisible({ timeout: 20_000 });
      }

      // E nada duplicou: "Leite integral" aparece UMA vez em cada tela, porque
      // os dois escreveram no mesmo documento (itemId determinístico).
      for (const pagina of [aparelhoA, aparelhoB]) {
        await expect(itemNaLista(pagina, 'Leite integral')).toHaveCount(1);
        await expect(itemNaLista(pagina, 'Arroz branco')).toHaveCount(1);
      }

      // A quantidade SOMOU as duas adições offline (increment, não sobrescrita).
      await expect(
        quantidadeDoItem(aparelhoA, 'Leite integral', /^2\s*(un|L)$/),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await contextoA.close();
      await contextoB.close();
    }
  });

  test('a lista abre offline com o que está em cache', async ({ browser }) => {
    const contexto = await browser.newContext();

    try {
      const pagina = await abrirAparelho(contexto);
      const listId = await criarLista(pagina);
      await adicionarPelaBusca(pagina, 'leite integral', 'Leite integral');
      await expect(itemNaLista(pagina, 'Leite integral')).toBeVisible();

      // O app só abre offline depois de o service worker assumir o controle.
      await aguardarServiceWorker(pagina);

      // Fica offline e recarrega: o app tem de abrir normalmente.
      await contexto.setOffline(true);
      await pagina.goto(`/?l=${listId}`);

      await expect(pagina.getByRole('heading', { name: 'Mercado E2E' })).toBeVisible({
        timeout: 20_000,
      });
      await expect(itemNaLista(pagina, 'Leite integral')).toBeVisible({ timeout: 20_000 });

      // E o status mostra offline, não uma tela de erro.
      await expect(pagina.getByRole('status', { name: /Offline/ })).toBeVisible();
    } finally {
      await contexto.close();
    }
  });
});

test.describe('fluxo básico', () => {
  test('busca tolera acento e erro de digitação', async ({ browser }) => {
    const contexto = await browser.newContext();
    try {
      const pagina = await abrirAparelho(contexto);
      await criarLista(pagina);

      const busca = pagina.getByRole('searchbox', { name: 'Buscar produto' });

      // Sem acento encontra o produto acentuado.
      await busca.fill('pao de queijo');
      await expect(
        pagina.getByRole('button', { name: /Pão de queijo/ }).first(),
      ).toBeVisible({ timeout: 15_000 });

      // Com erro de digitação também.
      await busca.fill('arros');
      await expect(
        pagina.getByRole('button', { name: /Arroz/ }).first(),
      ).toBeVisible({ timeout: 15_000 });
    } finally {
      await contexto.close();
    }
  });

  test('adicionar duas vezes soma a quantidade e avisa', async ({ browser }) => {
    const contexto = await browser.newContext();
    try {
      const pagina = await abrirAparelho(contexto);
      await criarLista(pagina);

      await adicionarPelaBusca(pagina, 'leite integral', 'Leite integral');
      await adicionarPelaBusca(pagina, 'leite integral', 'Leite integral');

      await expect(
        pagina.getByText('Já está na lista, aumentei a quantidade (+1)'),
      ).toBeVisible({ timeout: 10_000 });
    } finally {
      await contexto.close();
    }
  });

  test('item personalizado removido revive do zero ao ser adicionado de novo', async ({
    browser,
  }) => {
    // Regressão: o app procurava o documento do item personalizado por um id
    // diferente do que o listRepo grava ("p_item de teste" em vez de
    // "p_item-de-teste"), então o revive não acontecia e a quantidade antiga
    // voltava junto.
    const contexto = await browser.newContext();
    try {
      const pagina = await abrirAparelho(contexto);
      await criarLista(pagina);

      const busca = pagina.getByRole('searchbox', { name: 'Buscar produto' });

      // Cria um item fora do catálogo com 1 unidade e aumenta para 3.
      await busca.fill('Tempero da vovó');
      await pagina.getByRole('button', { name: /Adicionar “Tempero da vovó”/ }).click();
      await expect(itemNaLista(pagina, 'Tempero da vovó')).toBeVisible({ timeout: 15_000 });

      await busca.fill('Tempero da vovó');
      await pagina
        .getByRole('button', { name: 'Adicionar direto: Tempero da vovó', exact: true })
        .click();
      await busca.fill('');
      await expect(quantidadeDoItem(pagina, 'Tempero da vovó', /^2\s*un$/)).toBeVisible({
        timeout: 10_000,
      });

      // Remove e adiciona de novo.
      const botaoRemover = pagina.getByRole('button', {
        name: 'Remover: Tempero da vovó',
        exact: true,
      });
      await botaoRemover.focus();
      await botaoRemover.press('Enter');
      await expect(itemNaLista(pagina, 'Tempero da vovó')).toHaveCount(0, { timeout: 10_000 });

      await busca.fill('Tempero da vovó');
      await pagina
        .getByRole('button', { name: 'Adicionar direto: Tempero da vovó', exact: true })
        .click();
      await busca.fill('');

      // Volta com 1, não com 3: o revive recomeça do zero.
      await expect(itemNaLista(pagina, 'Tempero da vovó')).toBeVisible({ timeout: 10_000 });
      await expect(quantidadeDoItem(pagina, 'Tempero da vovó', /^1\s*un$/)).toBeVisible({
        timeout: 10_000,
      });
    } finally {
      await contexto.close();
    }
  });

  test('re-adicionar um frequente reusa o item do catálogo, sem duplicar', async ({ browser }) => {
    // Regressão: "Comprados com frequência" adicionava só pelo NOME, gerando
    // um itemId `p_<slug>` paralelo ao do catálogo — a duplicação que o itemId
    // determinístico existe para evitar.
    const contexto = await browser.newContext();
    try {
      const pagina = await contexto.newPage();
      // "Limpar comprados" pede confirmação; sem um ouvinte, o Playwright
      // DISPENSA o diálogo e a ação não acontece.
      pagina.on('dialog', (dialogo) => void dialogo.accept());
      pagina.on('console', (msg) => {
        if (msg.type() === 'error') console.log('[console do app]', msg.text());
      });
      await pagina.goto('/');
      await criarLista(pagina);

      // Compra o item e limpa os comprados, para ele entrar no histórico.
      await adicionarPelaBusca(pagina, 'leite integral', 'Leite integral');
      await pagina
        .getByRole('checkbox', { name: 'Marcar como comprado: Leite integral' })
        .click();

      await pagina.getByRole('button', { name: 'Limpar comprados' }).click();
      await expect(itemNaLista(pagina, 'Leite integral')).toHaveCount(0, { timeout: 15_000 });

      // Agora ele aparece como frequente; um toque devolve para a lista.
      const chipFrequente = pagina.getByRole('button', {
        name: 'Adicionar de novo: Leite integral',
      });
      await expect(chipFrequente).toBeVisible({ timeout: 15_000 });
      await chipFrequente.click();

      // Voltou UMA vez só — e não um item do catálogo mais um personalizado.
      await expect(itemNaLista(pagina, 'Leite integral')).toHaveCount(1, { timeout: 15_000 });
    } finally {
      await contexto.close();
    }
  });

  test('link inexistente mostra "Lista não encontrada", sem criar lista', async ({ browser }) => {
    const contexto = await browser.newContext();
    try {
      const pagina = await contexto.newPage();
      // Id com formato válido, mas que não existe no servidor.
      await pagina.goto('/?l=NaoExisteEstaListaAquiXy');

      await expect(pagina.getByText('Lista não encontrada')).toBeVisible({ timeout: 25_000 });
      await expect(pagina.getByRole('button', { name: 'Criar nova lista' })).toBeVisible();
    } finally {
      await contexto.close();
    }
  });

  test('remover tem desfazer', async ({ browser }) => {
    const contexto = await browser.newContext();
    try {
      const pagina = await abrirAparelho(contexto);
      await criarLista(pagina);
      await adicionarPelaBusca(pagina, 'tomate', 'Tomate');
      await expect(itemNaLista(pagina, 'Tomate')).toBeVisible();

      // Removemos pelo TECLADO de propósito: é o caminho de quem não usa o
      // swipe (teclado ou leitor de tela), e foi exatamente o que faltava
      // antes de as ações deixarem de ser aria-hidden/tabIndex=-1.
      const botaoRemover = pagina.getByRole('button', { name: 'Remover: Tomate', exact: true });
      await botaoRemover.focus();
      await botaoRemover.press('Enter');

      // O toast com "Desfazer" dura 6 s, então o pegamos antes de gastar tempo
      // em outras asserções.
      const desfazer = pagina.getByRole('button', { name: 'Desfazer' });
      await expect(desfazer).toBeVisible({ timeout: 5000 });
      await expect(itemNaLista(pagina, 'Tomate')).toHaveCount(0, { timeout: 3000 });

      await desfazer.click();
      await expect(itemNaLista(pagina, 'Tomate')).toBeVisible({ timeout: 10_000 });
    } finally {
      await contexto.close();
    }
  });
});

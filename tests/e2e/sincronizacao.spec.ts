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

/** Dois contextos = dois "aparelhos" com armazenamento e rede independentes. */
async function abrirAparelho(
  contexto: BrowserContext,
  listId?: string,
): Promise<Page> {
  const pagina = await contexto.newPage();
  await pagina.goto(listId ? `/?l=${listId}` : '/');
  return pagina;
}

/** Cria a lista inicial e devolve o id que foi para a URL. */
async function criarLista(pagina: Page, nome = 'Mercado E2E'): Promise<string> {
  await pagina.getByLabel('Nome da lista').fill(nome);
  await pagina.getByRole('button', { name: 'Criar nova lista' }).click();

  // O id só vai para a URL depois de o servidor confirmar a criação.
  await expect(pagina).toHaveURL(/\?l=[A-Za-z0-9]{20,40}/, { timeout: 20_000 });
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
    .getByText(nome, { exact: true })
    .locator('xpath=ancestor::li[1]')
    .getByText(texto);
}

function itemNaLista(pagina: Page, nome: string) {
  // O nome aparece dentro do grupo da categoria, na lista principal.
  return pagina.getByRole('main').getByText(nome, { exact: true });
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
      await expect(itemNaLista(pagina, 'Tomate')).toHaveCount(0, { timeout: 10_000 });

      await pagina.getByRole('button', { name: 'Desfazer' }).click();
      await expect(itemNaLista(pagina, 'Tomate')).toBeVisible({ timeout: 10_000 });
    } finally {
      await contexto.close();
    }
  });
});

# 🛒 Lista de Mercado da Família

Lista de supermercado **compartilhada em tempo real** entre os celulares da
família. Quem percebe que algo está acabando adiciona na hora, e todo mundo vê
na mesma hora — inclusive dentro do mercado, mesmo sem internet.

- **Sem login, sem cadastro.** Quem tem o link, tem a lista.
- **Funciona offline.** Adicione itens no corredor sem sinal; sincroniza sozinho.
- **Instala no celular** como um aplicativo (Android e iPhone).
- **1.480 produtos** do mercado brasileiro já catalogados, com busca que
  aguenta erro de digitação, falta de acento e apelido ("refri", "miojo",
  "aipim", "breja").
- **Grátis.** Roda inteiro no plano gratuito (Spark) do Firebase.

---

## Índice

1. [Como funciona na prática](#como-funciona-na-prática)
2. [Criar o projeto no Firebase](#1-criar-o-projeto-no-firebase)
3. [Configurar o `.env`](#2-configurar-o-env)
4. [Rodar na sua máquina](#3-rodar-na-sua-máquina)
5. [Publicar na internet](#4-publicar-na-internet-firebase-hosting)
6. [Instalar no celular](#5-instalar-no-celular)
7. [Compartilhar com a família](#6-compartilhar-com-a-família)
8. [Testes](#testes)
9. [Checklist final](#checklist-final)
10. [Notificações push (opcional e pago)](#notificações-push-opcional-e-pago)
11. [Privacidade e segurança](#privacidade-e-segurança)
12. [Perguntas frequentes](#perguntas-frequentes)

---

## Como funciona na prática

1. Alguém abre o aplicativo e cria a lista (**só isso exige internet**).
2. Essa pessoa manda o link no grupo da família.
3. Quem abrir o link entra na **mesma lista**, sem criar conta.
4. A partir daí, tudo funciona offline e sincroniza sozinho.

> ### ⚠️ O link é a chave da lista
>
> Não existe senha. **Qualquer pessoa com o link vê e edita a lista.** É o
> mesmo modelo de um documento compartilhado por link. Mande no grupo da
> família e não publique em lugar aberto.
>
> E guarde o link em outro lugar também (fixado no grupo, nos favoritos): se
> você limpar os dados do navegador, o atalho local se perde — mas a lista
> continua lá para quem tiver o link.

---

## 1. Criar o projeto no Firebase

Tudo aqui é no plano gratuito.

### 1.1 Criar o projeto

1. Acesse <https://console.firebase.google.com> e entre com sua conta Google.
2. Clique em **Adicionar projeto**, dê um nome (ex.: `lista-da-familia`).
3. O Google Analytics é **opcional** — pode desativar, o app não usa.

### 1.2 Ativar o Firestore

1. No menu lateral: **Criar** → **Firestore Database** → **Criar banco de dados**.
2. Escolha **Modo de produção** (as regras deste repositório cuidam do acesso).
3. Local: **`southamerica-east1` (São Paulo)**, se estiver no Brasil.

### 1.3 Ativar a autenticação anônima

1. Menu lateral: **Criar** → **Authentication** → **Vamos começar**.
2. Aba **Sign-in method** → **Anônimo** → **Ativar** → **Salvar**.

Isso **não** cria login para ninguém: é só um identificador descartável que as
regras de segurança exigem.

### 1.4 Registrar o aplicativo web

1. **⚙️ Configurações do projeto** → role até **Seus aplicativos**.
2. Clique no ícone **`</>`** (Web), dê um apelido e **Registrar app**.
3. Aparece um bloco `const firebaseConfig = { ... }`. **Deixe essa tela aberta**:
   os valores vão para o `.env` no próximo passo.

### 1.5 Ativar o App Check (reCAPTCHA v3)

O App Check impede que outras pessoas usem o seu projeto do Firebase a partir
de outro site. Junto com as regras, é a proteção real do app.

1. Menu lateral: **Criar** → **App Check**.
2. Na aba **Apps**, encontre seu app web e clique em **reCAPTCHA v3**.
3. Será pedida a **chave do site** do reCAPTCHA v3:
   - abra <https://www.google.com/recaptcha/admin/create>;
   - tipo: **reCAPTCHA v3**;
   - domínios: `localhost` e o domínio onde você vai publicar
     (ex.: `lista-da-familia.web.app`);
   - copie a **chave do site** (a *chave secreta* fica no Firebase, não no `.env`).
4. Volte ao Firebase, cole a chave e **Salvar**.
5. **Importante:** deixe o App Check em modo de **monitoramento** por alguns
   dias antes de **aplicar (enforce)**. Se aplicar antes de o app estar
   publicado e funcionando, você se tranca do lado de fora.

---

## 2. Configurar o `.env`

```bash
cp .env.example .env
```

Abra o `.env` e preencha com os valores da tela do passo 1.4:

| Variável | De onde vem |
|---|---|
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | `appId` |
| `VITE_APPCHECK_RECAPTCHA_KEY` | chave **do site** do reCAPTCHA v3 (passo 1.5) |

> **Essas chaves não são secretas.** Elas vão dentro do JavaScript que o
> navegador baixa — isso é normal e documentado pelo Google. Quem protege a
> sua lista são as **regras do Firestore** e o **App Check**. Nunca coloque
> aqui uma chave de conta de serviço.

Por último, aponte o projeto no `.firebaserc`:

```json
{ "projects": { "default": "o-id-do-seu-projeto" } }
```

---

## 3. Rodar na sua máquina

Requisito: **Node.js 20 ou mais novo**.

```bash
npm install
npm run dev
```

Abra <http://localhost:5173>.

Para desenvolver sem tocar no banco de verdade, use os emuladores:

```bash
# terminal 1
npm run emulators

# terminal 2 — descomente as linhas VITE_*_EMULATOR no .env e rode
npm run dev
```

---

## 4. Publicar na internet (Firebase Hosting)

```bash
npm install -g firebase-tools     # só na primeira vez
firebase login
npm run build
firebase deploy
```

Ao final, o terminal mostra o endereço (ex.: `https://lista-da-familia.web.app`).

> **Publique as regras.** O `firebase deploy` acima já envia tudo (hosting +
> regras + índices). Se quiser mandar só as regras:
> ```bash
> npm run deploy:rules
> ```
> **Sem as regras publicadas, o banco fica com as regras padrão do Firebase.**
> Esse é o passo de segurança mais importante do processo.

### Domínio próprio (opcional)

Console → **Hosting** → **Adicionar domínio personalizado**. Depois de
configurar, acrescente o novo domínio na chave do reCAPTCHA (passo 1.5) e em
**Authentication → Settings → Domínios autorizados**.

---

## 5. Instalar no celular

Instalar deixa o app mais rápido, em tela cheia e com ícone na tela de início.
**Não é obrigatório** — funciona no navegador também.

### Android (Chrome)

1. Abra o link do app no Chrome.
2. Aparece o aviso **"Instalar na tela de início"** → toque em **Instalar**.
3. Se não aparecer: menu **⋮** → **Instalar aplicativo** (ou "Adicionar à tela
   inicial").

### iPhone e iPad (Safari)

No iPhone **nenhum site pode se instalar sozinho** — tem de ser pelo Safari:

1. Abra o link **no Safari** (não funciona pelo Chrome do iPhone).
2. Toque no botão **Compartilhar** (quadrado com seta para cima).
3. Role a lista e toque em **Adicionar à Tela de Início**.
4. Toque em **Adicionar**, no canto superior direito.

O próprio app mostra esse passo a passo ilustrado na primeira abertura, e ele
fica sempre disponível em **Ajustes → Instalar o aplicativo**.

---

## 6. Compartilhar com a família

No app, toque no ícone **compartilhar** (↗) no topo. Você tem quatro opções:

- **Copiar link** — para colar onde quiser;
- **Enviar pelo WhatsApp** — já com uma mensagem pronta;
- **Compartilhar…** — abre o menu nativo do celular;
- **QR Code** — a pessoa aponta a câmera e entra.

Também há o **código da lista** (24 caracteres), para quem preferir digitar em
**Minhas listas → Entrar em uma lista**.

### Várias listas

Toque no **nome da lista**, no topo, para trocar de lista ou criar outra
("Mercado", "Feira", "Farmácia"). Cada lista tem o próprio link.

---

## Testes

```bash
npm run lint          # ESLint
npm run build         # build de produção
npm run test          # Vitest — 111 testes
```

Regras e ponta a ponta precisam do emulador rodando:

```bash
# terminal 1
npm run emulators

# terminal 2
npm run test:rules    # 43 testes das regras do Firestore
npm run test:e2e      # 8 testes Playwright (2 navegadores + offline)
```

> **Se os testes de regras ou de ponta a ponta começarem a falhar todos de
> uma vez**, normalmente é o emulador que caiu (ele às vezes morre ao
> recarregar as regras sozinho). Confira com
> `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:9099/` — se não
> responder `200`, encerre e rode `npm run emulators` de novo.
>
> Um teste de ponta a ponta marcado como **flaky** (passou na segunda
> tentativa) quase sempre é a conexão com o emulador caindo por um instante
> — a mensagem no console é *"Could not reach Cloud Firestore backend"*. Uma
> falha de verdade erra nas duas tentativas.

O que está coberto:

- **Busca** — acentos, maiúsculas, sinônimos, erro de digitação, ordem dos
  resultados e frequentes passando na frente.
- **Anti-duplicação** — dois aparelhos offline adicionando o mesmo item
  terminam com **um** documento e a quantidade **somada**.
- **Soft delete e revive** — remover preserva o documento; adicionar de novo
  revive do zero, sem trazer a quantidade antiga.
- **Regras** — o primeiro teste garante que **listar a coleção raiz falha**;
  sem isso o id aleatório não protegeria nada.
- **Catálogo** — ids únicos e estáveis, campos obrigatórios, metas por
  categoria e ausência de marcas.
- **Ponta a ponta** — A adiciona e B vê em menos de 2 s; os dois offline
  adicionam, reconectam, e nada duplica nem se perde.

---

## Checklist final

Depois de publicar, confira:

- [ ] O app abre no endereço publicado.
- [ ] **Instala no Android** (banner ou menu ⋮ → Instalar aplicativo).
- [ ] **Instala no iPhone** (Safari → Compartilhar → Adicionar à Tela de Início).
- [ ] **Abre offline**: ative o modo avião e abra o app — a lista aparece.
- [ ] **Sincroniza entre 2 aparelhos**: adicione em um, veja aparecer no outro.
- [ ] **Offline nos dois**: ambos em modo avião, cada um adiciona, religue a
      internet — nada duplicou e nada se perdeu.
- [ ] **Regras publicadas** (`npm run deploy:rules`) e testadas
      (`npm run test:rules`).
- [ ] **App Check** ativado e, depois de alguns dias em monitoramento, aplicado.
- [ ] **Lighthouse ≥ 90** em PWA, Desempenho e Acessibilidade
      (Chrome → F12 → Lighthouse → modo anônimo, perfil Mobile).

---

## Notificações push (opcional e pago)

Avisos do tipo *"Maria adicionou Leite à lista"* **não estão ativos** e são
totalmente opcionais.

⚠️ Push exige **Cloud Functions**, que exige o **plano Blaze (pago)**. Não há
caminho para push no plano gratuito. Para uma família o custo tende a zero,
mas é um plano com cartão cadastrado.

⚠️ No iPhone, push de PWA só funciona com o app **instalado na Tela de Início**
e **iOS 16.4 ou mais novo**.

Tudo está isolado em [`functions/`](functions/README.md), com o passo a passo
(incluindo como criar um alerta de orçamento antes de ativar). **Se você não
quiser pagar, simplesmente não ative** — o app funciona perfeitamente sem isso,
já que a sincronização em tempo real acontece com o app aberto.

---

## Privacidade e segurança

- **Nenhum dado pessoal** além do nome que você escolher digitar em Ajustes
  (que fica salvo só no seu aparelho e serve para mostrar "adicionado por Maria").
- **Sem analytics de terceiros**, sem rastreamento, sem anúncios.
- **Ninguém consegue listar as listas.** As regras proíbem consultar a coleção
  raiz: só é possível abrir uma lista sabendo o id completo dela.
- As regras validam tipos, tamanhos (nome ≤ 80, observação ≤ 200, quantidade
  entre 0 e 999), categorias, unidades e o formato do id de cada item.
- O app pede ao navegador para **proteger os dados locais**
  (`navigator.storage.persist()`), reduzindo o risco de a lista offline ser
  apagada por falta de espaço.
- O texto completo está na tela **Ajustes → Privacidade**.

### Apagar tudo

Esvazie a lista pelo app (**Esvaziar a lista**) e, no Console do Firebase,
apague o documento da lista em **Firestore Database**.

---

## Perguntas frequentes

**Preciso de internet para usar?**
Só na primeira vez (para criar a lista ou entrar em uma lista nova). Depois
disso tudo funciona offline e sincroniza sozinho quando a conexão volta.

**Duas pessoas podem adicionar o mesmo item ao mesmo tempo?**
Podem. O app usa um identificador derivado do nome do produto, então as duas
adições caem no **mesmo item** e a quantidade **soma** — nunca duplica.

**E se duas pessoas escreverem observações diferentes ao mesmo tempo?**
Se uma delas já estiver vendo o texto da outra, o app **junta** as duas
("marca X / sem lactose"). Se as duas estiverem offline ao mesmo tempo, vale a
última que sincronizar — mas a quantidade soma mesmo assim.

**Perdi o link. E agora?**
Procure em **Minhas listas** (dentro do app, tocando no nome da lista): ficam
salvas as listas já abertas naquele aparelho. Se os dados do navegador foram
apagados, peça o link para alguém da família — não há outra forma de recuperar,
porque não existe conta.

**Quanto custa?**
Nada. O uso de uma família fica muito abaixo da cota gratuita do Firebase. A
única parte paga é a de notificações push, que vem desativada.

**Posso mudar os produtos do catálogo?**
Pode. Os arquivos estão em `src/data/catalog/`, um por categoria. Edite, rode
`npm run catalog:validate` e publique. **Não mude o `id` de um produto já
usado** — ele identifica o item nas listas existentes.

**A ordem das categorias não é a do meu mercado.**
Vá em **Ajustes → Ordem dos corredores** e arraste. A ordem vale para toda a
família.

---

## Tecnologias

Vite · React · TypeScript (strict) · Tailwind CSS · Framer Motion ·
lucide-react · vite-plugin-pwa (Workbox) · Firebase (Firestore, Auth anônima,
App Check, Hosting) · MiniSearch em Web Worker · Vitest · Playwright ·
Firebase Emulator Suite.

Detalhes de arquitetura e das decisões técnicas: [`CLAUDE.md`](CLAUDE.md).

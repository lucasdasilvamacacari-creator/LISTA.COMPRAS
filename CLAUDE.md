# CLAUDE.md — contexto do projeto

Arquivo para manter contexto entre sessões. Para instruções de uso e de
publicação, veja o `README.md`.

## O que é

PWA colaborativo em tempo real para uma família gerenciar a lista de
supermercado. Sem login. Funciona offline. Interface 100% em pt-BR.

## Comandos

```bash
npm run dev               # desenvolvimento
npm run build             # build de produção
npm run lint              # ESLint (precisa ficar em zero)
npm run test              # Vitest (unitários)
npm run emulators         # Firebase Emulator Suite (firestore + auth)
npm run test:rules        # testes das regras (precisa do emulador rodando)
npm run test:e2e          # Playwright (precisa do emulador rodando)
npm run icons             # regera ícones e splash screens a partir do SVG
npm run catalog:validate  # valida o catálogo (roda antes de cada commit de lote)
npm run catalog:report    # relatório de produtos por categoria
npm run deploy            # build + firebase deploy
```

Em container/CI onde o Chromium do Playwright não casa com a versão do pacote:
`PLAYWRIGHT_CHROMIUM_PATH=/caminho/para/chromium npm run test:e2e`.

## Arquitetura

```
src/
  components/   UI (Toast, BottomSheet, SheetItem, ListaItens, LinhaItem, …)
  hooks/        useList, useCatalogSearch, useOnlineStatus, useListaAtiva,
                useVoz, useWakeLock, useInstalacao, useToast
  lib/          firebase, listRepo, busca, texto, ids, exportar, theme,
                armazenamentoLocal, dispositivo, links, env, push
  data/catalog/ um arquivo por categoria + index.ts (carregamento lazy)
  workers/      busca.worker.ts (MiniSearch fora da thread principal)
  i18n/         pt-BR.ts — TODOS os textos ficam aqui
  types/        tipos compartilhados e constantes (CATEGORIAS, UNIDADES, …)
functions/      push por FCM — OPCIONAL, desligado, exige plano Blaze
tests/
  unit/         Vitest
  rules/        regras do Firestore no emulador
  e2e/          Playwright (dois contextos de navegador + offline)
```

## Decisões que não podem ser desfeitas sem pensar

### 1. `itemId` é determinístico
- produto do catálogo → o próprio `catalogId` (slug)
- item personalizado → `p_` + slug do nome

É isso que faz dois aparelhos offline adicionando "Leite" escreverem no MESMO
documento, em vez de criarem duas linhas. Mudar um `id` do catálogo depois do
app publicado quebra o item na lista de alguém — por isso `catalog:validate`
exige que `id === slug(id)` e que não haja duplicatas.

### 2. Quantidade SEMPRE com `increment()`
Nunca ler o número e escrever `qty: lido + 1`. Dois aparelhos offline fariam a
mesma conta e um sobrescreveria o outro. Há um teste que falha se `qty` virar
um número absoluto em `adicionarItem`.

### 3. Nunca `runTransaction`
Transação exige ida ao servidor e falha offline. Usamos `setDoc(..., {merge:true})`
e `writeBatch`, que entram na fila local.

### 4. Remoção é soft delete
`deleted: true` + `qty: 0`, documento preservado. Hard delete offline faria o
item "ressuscitar" ao sincronizar com outro aparelho, e o revive não teria em
qual documento mesclar. A limpeza de verdade (30 dias) é feita pelo cliente,
no máximo uma vez por dia por aparelho.

### 5. Revive parte do zero
Adicionar de novo um item apagado ou já comprado zera e incrementa no MESMO
`writeBatch` — a quantidade antiga não volta junto.

### 6. `list` na raiz `lists` é PROIBIDO
Sem essa regra, o id aleatório de 24 caracteres não protegeria nada: qualquer
usuário anônimo poderia enumerar as listas de todas as famílias. É o primeiro
teste de `tests/rules/firestore.test.ts`.

### 7. Nunca criar lista a partir de um id da URL
Se o `?l=` não existir no servidor, mostramos "Lista não encontrada". Criar
silenciosamente faria um link digitado errado virar uma lista vazia, e a
família acharia que perdeu tudo. E "não encontrada" só é acusado quando o
SERVIDOR confirma a ausência (`!snapshot.metadata.fromCache`): offline com
cache vazio é primeira abertura sem rede, não lista inexistente.

### 8. Observação: last-write-wins por campo, com concatenação
Quando o texto anterior está no cache local e é diferente, concatenamos
("marca X / sem lactose"). Offline simultâneo resulta em last-write-wins na
observação — comportamento conhecido, documentado e coberto por teste. A
quantidade soma mesmo nesse caso.

### 9. Compatibilidade entre versões
`schemaVersion` no documento da lista; campos novos sempre OPCIONAIS; o app
ignora o que não conhece. Categorias desconhecidas (vindas de uma versão mais
nova no aparelho de outra pessoa) vão para o fim da lista em vez de sumirem.
O service worker usa prompt com `skipWaiting: false`, para não recarregar o
app embaixo do dedo de quem está comprando.

### 10. Ações de item não podem depender do swipe
Editar e remover ficam sempre na ordem de tabulação (sem `aria-hidden`, sem
`tabIndex={-1}`); receber foco abre a linha. O swipe é só um atalho visual.

## Catálogo

1.480 produtos, 17 categorias, todos acima da meta. Um arquivo por categoria em
`src/data/catalog/`. Sem marcas — marca é escolha do usuário e vai na
observação. Para adicionar produtos: edite o arquivo da categoria, rode
`npm run catalog:validate` e só então faça o commit.

O catálogo é carregado de forma lazy (chunk separado) mas entra no precache do
service worker, para a busca funcionar offline.

## Busca

Prioridade: frequentes da família > exato > prefixo do nome > sinônimo >
contém > fuzzy (Levenshtein com limite por tamanho da palavra). Roda em Web
Worker, com fallback automático para a thread principal. Debounce de 90 ms e
descarte de respostas fora de ordem.

## Pendências conhecidas

- Lighthouse ainda não foi medido em produção (precisa do deploy).
- Os testes E2E cobrem Chromium; não foram rodados em WebKit/Firefox.

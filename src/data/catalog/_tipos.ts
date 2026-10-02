/**
 * Formato dos arquivos de catálogo.
 *
 * Um arquivo por categoria, em `src/data/catalog/<categoria>.ts`, exportando
 * `const produtos: Produto[]`. O índice (`src/data/catalog/index.ts`) junta tudo
 * e é carregado de forma lazy — mas entra no precache do service worker, para
 * que a busca funcione offline.
 *
 * REGRAS do catálogo (validadas por `npm run catalog:validate`):
 *  - `id` é um slug estável e IMUTÁVEL: ele é usado como `itemId` no Firestore.
 *    Mudar um id depois do app publicado "quebra" o item na lista de alguém.
 *  - SEM MARCAS. "Leite integral", nunca "Leite Marca X" — a marca é escolha do
 *    usuário e vai no campo de observação.
 *  - `sinonimos` é obrigatório e não pode estar vazio: é o que faz a busca
 *    encontrar "refri" → "Refrigerante" e "massa" → "Macarrão".
 */
export type { Produto } from '@/types';

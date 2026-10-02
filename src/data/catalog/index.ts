/**
 * Índice do catálogo.
 *
 * O catálogo tem ~1.500 produtos, então ele é carregado de forma LAZY: o
 * `import()` dinâmico vira um chunk separado no build (veja `manualChunks` em
 * vite.config.ts) e o service worker o coloca no precache, então a busca
 * funciona offline mesmo sem nunca ter sido aberta online.
 *
 * `carregarCatalogo()` é idempotente: chame quantas vezes quiser.
 */
import type { CategoriaId, Produto } from '@/types';

let cache: Produto[] | null = null;
let carregando: Promise<Produto[]> | null = null;

async function importarTudo(): Promise<Produto[]> {
  const modulos = await Promise.all([
    import('./hortifruti'),
    import('./acougue'),
    import('./peixaria'),
    import('./frios-laticinios'),
    import('./padaria'),
    import('./mercearia'),
    import('./matinais-doces'),
    import('./biscoitos-snacks'),
    import('./bebidas'),
    import('./congelados'),
    import('./saudaveis'),
    import('./bebe-infantil'),
    import('./higiene'),
    import('./limpeza'),
    import('./descartaveis'),
    import('./pet'),
    import('./churrasco'),
  ]);
  return modulos.flatMap((m) => m.produtos);
}

/** Carrega (uma vez) todos os produtos do catálogo. */
export function carregarCatalogo(): Promise<Produto[]> {
  if (cache) return Promise.resolve(cache);
  if (carregando) return carregando;
  carregando = importarTudo().then((produtos) => {
    cache = produtos;
    carregando = null;
    return produtos;
  });
  return carregando;
}

/** `null` quando o catálogo ainda não foi carregado (para render sem await). */
export function catalogoEmCache(): Produto[] | null {
  return cache;
}

/** Índice por id, para resolver `catalogId` → produto em O(1). */
let porId: Map<string, Produto> | null = null;

export async function indicePorId(): Promise<Map<string, Produto>> {
  if (porId) return porId;
  const produtos = await carregarCatalogo();
  porId = new Map(produtos.map((p) => [p.id, p]));
  return porId;
}

/** Produtos de uma categoria, em ordem alfabética (usado na tela Explorar). */
export async function produtosDaCategoria(categoria: CategoriaId): Promise<Produto[]> {
  const produtos = await carregarCatalogo();
  return produtos
    .filter((p) => p.categoria === categoria)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Subcategorias de uma categoria, com a contagem de produtos de cada uma. */
export async function subcategoriasDe(
  categoria: CategoriaId,
): Promise<{ nome: string; total: number }[]> {
  const produtos = await produtosDaCategoria(categoria);
  const mapa = new Map<string, number>();
  for (const p of produtos) {
    const chave = p.subcategoria ?? 'Outros';
    mapa.set(chave, (mapa.get(chave) ?? 0) + 1);
  }
  return [...mapa.entries()]
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

/** Quantidade de produtos por categoria (para a grade da tela Explorar). */
export async function contagemPorCategoria(): Promise<Map<CategoriaId, number>> {
  const produtos = await carregarCatalogo();
  const mapa = new Map<CategoriaId, number>();
  for (const p of produtos) mapa.set(p.categoria, (mapa.get(p.categoria) ?? 0) + 1);
  return mapa;
}

/** Usado pelos testes. */
export function _limparCacheCatalogo(): void {
  cache = null;
  carregando = null;
  porId = null;
}

/**
 * Tipos compartilhados do app.
 *
 * `schemaVersion` existe para que uma versão nova do app não quebre um
 * aparelho que ainda está rodando a versão antiga: campos novos são sempre
 * OPCIONAIS e o app ignora o que não conhece (compatibilidade retroativa).
 */

export const SCHEMA_VERSION = 1;

/** Limite de itens ativos por lista (não é regra do Firestore, é UX + custo). */
export const MAX_ITENS_ATIVOS = 500;

export const UNIDADES = [
  'un',
  'kg',
  'g',
  'L',
  'ml',
  'pacote',
  'caixa',
  'dúzia',
  'bandeja',
] as const;

export type Unidade = (typeof UNIDADES)[number];

/** Ordem padrão dos corredores do mercado (usada quando a lista não define outra). */
export const CATEGORIAS = [
  'hortifruti',
  'acougue',
  'peixaria',
  'frios-laticinios',
  'padaria',
  'mercearia',
  'matinais-doces',
  'biscoitos-snacks',
  'bebidas',
  'congelados',
  'saudaveis',
  'bebe-infantil',
  'higiene',
  'limpeza',
  'descartaveis',
  'pet',
  'churrasco',
  'outros',
] as const;

export type CategoriaId = (typeof CATEGORIAS)[number];

/** Produto do catálogo local (sem marcas — marca vai na observação do usuário). */
export interface Produto {
  /** Slug estável e imutável. É usado como `itemId` no Firestore. */
  id: string;
  nome: string;
  categoria: CategoriaId;
  subcategoria?: string;
  sinonimos: string[];
  unidadePadrao: Unidade;
  emoji?: string;
}

/** Produto criado pela família; aparece na busca junto com o catálogo. */
export interface ProdutoPersonalizado {
  id: string;
  nome: string;
  categoria: CategoriaId;
  sinonimos?: string[];
  unidadePadrao: Unidade;
  criadoPor?: string;
  createdAt?: unknown;
}

/** Documento de `lists/{listId}/items/{itemId}`. */
export interface Item {
  id: string;
  /** `null` quando é um item personalizado (fora do catálogo). */
  catalogId: string | null;
  name: string;
  category: CategoriaId;
  qty: number;
  unit: Unidade;
  note: string;
  checked: boolean;
  checkedBy: string | null;
  addedBy: string | null;
  /** `serverTimestamp()`; pode vir `null` enquanto a escrita está pendente. */
  createdAt: unknown;
  updatedAt: unknown;
  /** `Date.now()` do cliente — serve para ordenar enquanto está offline. */
  clientUpdatedAt: number;
  deleted: boolean;
  /** Opcional (recurso extra): preço unitário estimado em reais. */
  price?: number;
  /** Verdadeiro quando o Firestore ainda não confirmou a escrita no servidor. */
  pendente?: boolean;
}

/** Documento de `lists/{listId}`. */
export interface Lista {
  id: string;
  name: string;
  createdAt: unknown;
  /** Ordem dos corredores escolhida pela família (arrastável na UI). */
  aisleOrder: CategoriaId[];
  schemaVersion: number;
}

/** Documento de `lists/{listId}/history/{id}`: alimenta "Comprados com frequência". */
export interface HistoricoItem {
  id: string;
  name: string;
  category: CategoriaId;
  catalogId: string | null;
  unit: Unidade;
  count: number;
  lastAt: unknown;
  clientLastAt: number;
}

/** Referência local de uma lista salva no aparelho ("Minhas listas"). */
export interface ListaSalva {
  id: string;
  nome: string;
  ultimoAcesso: number;
}

export type StatusSync = 'sincronizado' | 'sincronizando' | 'offline';

/** Resultado de busca, já com a origem (catálogo, família ou texto livre). */
export interface ResultadoBusca {
  produto: Produto;
  origem: 'catalogo' | 'familia' | 'frequente';
  score: number;
}

/**
 * Repositório da lista: toda escrita no Firestore passa por aqui.
 *
 * REGRAS DE OURO (o que faz o offline funcionar sem duplicar nem perder nada):
 *
 *  - `setDoc(..., { merge: true })` sempre. Nunca `updateDoc` em documento que
 *    pode não existir, nunca `set` sem merge (apagaria campos de outro aparelho).
 *  - Quantidade SEMPRE com `increment()`. Nunca ler o número e escrever
 *    `qty: lido + 1` — dois aparelhos offline fariam o mesmo cálculo e um
 *    sobrescreveria o outro. Com `increment`, o servidor soma as duas operações.
 *  - NUNCA `runTransaction`: transações exigem ida ao servidor e falham offline.
 *    Usamos `setDoc` e `writeBatch`, que entram na fila local.
 *  - Remoção é SOFT DELETE (`deleted: true`, `qty: 0`). Hard delete offline faria
 *    o item "ressuscitar" sozinho ao sincronizar com outro aparelho, e o revive
 *    de um item apagado não teria em qual documento mesclar.
 *  - `updatedAt` usa `serverTimestamp()` (verdade do servidor) e
 *    `clientUpdatedAt` usa `Date.now()` (serve para ordenar enquanto offline,
 *    quando `updatedAt` ainda é `null`).
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { obterDb } from './firebase';
import { itemIdPersonalizado, itemIdDoCatalogo } from './ids';
import { capitalizar, slug } from './texto';
import {
  SCHEMA_VERSION,
  CATEGORIAS,
  type CategoriaId,
  type HistoricoItem,
  type Item,
  type Lista,
  type Produto,
  type ProdutoPersonalizado,
  type Unidade,
} from '@/types';

/** Dias que um item fica no banco depois de apagado, antes da limpeza. */
export const DIAS_ATE_LIMPEZA = 30;

const LIMITE_NOME = 80;
const LIMITE_OBS = 200;
const QTD_MAX = 999;

// ---------------------------------------------------------------------------
// Caminhos
// ---------------------------------------------------------------------------

export function refLista(listId: string, db: Firestore = obterDb()) {
  return doc(db, 'lists', listId);
}

export function refItens(listId: string, db: Firestore = obterDb()) {
  return collection(db, 'lists', listId, 'items');
}

export function refItem(listId: string, itemId: string, db: Firestore = obterDb()) {
  return doc(db, 'lists', listId, 'items', itemId);
}

export function refPersonalizados(listId: string, db: Firestore = obterDb()) {
  return collection(db, 'lists', listId, 'customProducts');
}

export function refHistorico(listId: string, db: Firestore = obterDb()) {
  return collection(db, 'lists', listId, 'history');
}

// ---------------------------------------------------------------------------
// Saneamento (a UI também valida, mas aqui é a última barreira antes do banco,
// e os mesmos limites estão repetidos nas firestore.rules)
// ---------------------------------------------------------------------------

export function limparNome(nome: string): string {
  return capitalizar(nome).slice(0, LIMITE_NOME);
}

export function limparObservacao(obs: string): string {
  return obs.replace(/\s+/g, ' ').trim().slice(0, LIMITE_OBS);
}

export function limparQtd(qtd: number): number {
  if (!Number.isFinite(qtd)) return 1;
  return Math.min(QTD_MAX, Math.max(0, Math.round(qtd * 1000) / 1000));
}

function categoriaValida(c: string): CategoriaId {
  return (CATEGORIAS as readonly string[]).includes(c) ? (c as CategoriaId) : 'outros';
}

// ---------------------------------------------------------------------------
// Lista
// ---------------------------------------------------------------------------

/** Ordem inicial dos corredores: a ordem natural de um mercado brasileiro. */
export function ordemCorredoresPadrao(): CategoriaId[] {
  return [...CATEGORIAS];
}

/**
 * Cria a lista. Exige internet na PRIMEIRA vez de todas porque precisamos
 * saber que o documento realmente existe no servidor antes de gravar o id na
 * URL — caso contrário um link errado criaria listas fantasma.
 */
export async function criarLista(
  listId: string,
  nome: string,
  db: Firestore = obterDb(),
): Promise<void> {
  await setDoc(
    refLista(listId, db),
    {
      name: limparNome(nome) || 'Mercado',
      createdAt: serverTimestamp(),
      aisleOrder: ordemCorredoresPadrao(),
      schemaVersion: SCHEMA_VERSION,
    },
    { merge: true },
  );
}

/** `null` quando a lista não existe (link digitado errado). */
export async function buscarLista(
  listId: string,
  db: Firestore = obterDb(),
): Promise<Lista | null> {
  const snap = await getDoc(refLista(listId, db));
  if (!snap.exists()) return null;
  return lerLista(listId, snap.data());
}

export function lerLista(id: string, dados: DocumentData | undefined): Lista {
  const ordem = Array.isArray(dados?.['aisleOrder'])
    ? (dados['aisleOrder'] as string[]).map(categoriaValida)
    : ordemCorredoresPadrao();
  // Garante que categorias novas (de uma versão mais recente do app) apareçam
  // no fim em vez de desaparecerem da tela.
  for (const c of CATEGORIAS) if (!ordem.includes(c)) ordem.push(c);
  return {
    id,
    name: typeof dados?.['name'] === 'string' ? (dados['name'] as string) : 'Mercado',
    createdAt: dados?.['createdAt'] ?? null,
    aisleOrder: ordem,
    schemaVersion:
      typeof dados?.['schemaVersion'] === 'number' ? (dados['schemaVersion'] as number) : 1,
  };
}

export async function renomearLista(
  listId: string,
  nome: string,
  db: Firestore = obterDb(),
): Promise<void> {
  await setDoc(refLista(listId, db), { name: limparNome(nome) || 'Mercado' }, { merge: true });
}

export async function salvarOrdemCorredores(
  listId: string,
  ordem: CategoriaId[],
  db: Firestore = obterDb(),
): Promise<void> {
  await setDoc(refLista(listId, db), { aisleOrder: ordem }, { merge: true });
}

// ---------------------------------------------------------------------------
// Itens
// ---------------------------------------------------------------------------

export function lerItem(snap: QueryDocumentSnapshot<DocumentData>): Item {
  const d = snap.data();
  return {
    id: snap.id,
    catalogId: typeof d['catalogId'] === 'string' ? (d['catalogId'] as string) : null,
    name: typeof d['name'] === 'string' ? (d['name'] as string) : snap.id,
    category: categoriaValida(String(d['category'] ?? 'outros')),
    qty: typeof d['qty'] === 'number' ? (d['qty'] as number) : 0,
    unit: (typeof d['unit'] === 'string' ? d['unit'] : 'un') as Unidade,
    note: typeof d['note'] === 'string' ? (d['note'] as string) : '',
    checked: d['checked'] === true,
    checkedBy: typeof d['checkedBy'] === 'string' ? (d['checkedBy'] as string) : null,
    addedBy: typeof d['addedBy'] === 'string' ? (d['addedBy'] as string) : null,
    createdAt: d['createdAt'] ?? null,
    updatedAt: d['updatedAt'] ?? null,
    clientUpdatedAt: typeof d['clientUpdatedAt'] === 'number' ? (d['clientUpdatedAt'] as number) : 0,
    deleted: d['deleted'] === true,
    ...(typeof d['price'] === 'number' ? { price: d['price'] as number } : {}),
    pendente: snap.metadata.hasPendingWrites,
  };
}

export interface DadosAdicionar {
  /** Produto do catálogo, quando houver. */
  produto?: Produto;
  /** Nome livre, para item personalizado. */
  nome?: string;
  categoria?: CategoriaId;
  unidade?: Unidade;
  qtd?: number;
  observacao?: string;
  preco?: number;
  autor?: string | null;
}

export interface ResultadoAdicionar {
  itemId: string;
  /** `true` quando o item já estava ativo na lista e só somamos quantidade. */
  jaExistia: boolean;
  /** Quantidade somada nesta operação (para o "Desfazer"). */
  incremento: number;
  nome: string;
}

/**
 * Adiciona (ou soma) um item.
 *
 * Três situações caem no mesmo documento, por conta do itemId determinístico:
 *  a) item novo               → cria com qty = incremento
 *  b) item já ativo na lista  → qty += incremento  (toast "aumentei a quantidade")
 *  c) item apagado ou comprado → REVIVE: deleted/checked voltam a false e a
 *     quantidade recomeça do zero (zeramos antes de incrementar).
 *
 * O caso (c) é o motivo de `estadoAtual` existir: só o chamador sabe o que o
 * cache local diz sobre o item neste instante.
 */
export async function adicionarItem(
  listId: string,
  dados: DadosAdicionar,
  estadoAtual: Item | null | undefined,
  db: Firestore = obterDb(),
): Promise<ResultadoAdicionar> {
  const produto = dados.produto;
  const nomeBruto = produto?.nome ?? dados.nome ?? '';
  const nome = limparNome(nomeBruto);
  if (!nome) throw new Error('Informe o nome do item.');

  const itemId = produto ? itemIdDoCatalogo(produto.id) : itemIdPersonalizado(nomeBruto);
  const incremento = limparQtd(dados.qtd ?? 1) || 1;
  const observacao = limparObservacao(dados.observacao ?? '');

  // Ativo = existe, não apagado e não comprado. Só nesse caso é "soma".
  const estaAtivo = !!estadoAtual && !estadoAtual.deleted && !estadoAtual.checked;
  // Reviver: o documento existe mas está apagado ou já foi comprado.
  const vaiReviver = !!estadoAtual && (estadoAtual.deleted || estadoAtual.checked);

  const base: Record<string, unknown> = {
    catalogId: produto ? produto.id : null,
    name: nome,
    category: produto?.categoria ?? dados.categoria ?? 'outros',
    unit: dados.unidade ?? produto?.unidadePadrao ?? 'un',
    checked: false,
    checkedBy: null,
    deleted: false,
    updatedAt: serverTimestamp(),
    clientUpdatedAt: Date.now(),
  };

  if (!estadoAtual) {
    base['createdAt'] = serverTimestamp();
    base['addedBy'] = dados.autor ?? null;
  }

  if (vaiReviver) {
    // Zera e soma em duas escritas no MESMO lote: a quantidade antiga não
    // "volta" junto com o item. `writeBatch` funciona offline (transação não).
    const lote = writeBatch(db);
    lote.set(refItem(listId, itemId, db), { ...base, qty: 0 }, { merge: true });
    lote.set(
      refItem(listId, itemId, db),
      { qty: increment(incremento), clientUpdatedAt: Date.now() },
      { merge: true },
    );
    if (observacao) lote.set(refItem(listId, itemId, db), { note: observacao }, { merge: true });
    else lote.set(refItem(listId, itemId, db), { note: '' }, { merge: true });
    if (typeof dados.preco === 'number' && Number.isFinite(dados.preco)) {
      lote.set(refItem(listId, itemId, db), { price: dados.preco }, { merge: true });
    }
    await lote.commit();
    return { itemId, jaExistia: false, incremento, nome };
  }

  const payload: Record<string, unknown> = { ...base, qty: increment(incremento) };

  if (observacao) {
    // Observação com last-write-wins POR CAMPO. Quando já existe um texto
    // diferente no cache local, concatenamos em vez de substituir, para não
    // apagar o pedido de outra pessoa ("marca X" + "sem lactose").
    const anterior = estaAtivo ? (estadoAtual?.note ?? '').trim() : '';
    if (!anterior) {
      payload['note'] = observacao;
    } else if (!anterior.toLowerCase().includes(observacao.toLowerCase())) {
      payload['note'] = limparObservacao(`${anterior} / ${observacao}`);
    }
    // Se o pedido já está na observação, não escrevemos nada: reescrever só
    // para mudar a capitalização do texto de outra pessoa é uma alteração
    // inútil que ainda pode entrar em conflito com uma edição de verdade.
  }

  if (typeof dados.preco === 'number' && Number.isFinite(dados.preco)) {
    payload['price'] = Math.max(0, Math.round(dados.preco * 100) / 100);
  }

  await setDoc(refItem(listId, itemId, db), payload, { merge: true });
  return { itemId, jaExistia: estaAtivo, incremento, nome };
}

/** Soma (ou subtrai) quantidade. Nunca escreve um número absoluto. */
export async function ajustarQuantidade(
  listId: string,
  itemId: string,
  delta: number,
  db: Firestore = obterDb(),
): Promise<void> {
  if (delta === 0) return;
  await setDoc(
    refItem(listId, itemId, db),
    {
      qty: increment(delta),
      deleted: false,
      updatedAt: serverTimestamp(),
      clientUpdatedAt: Date.now(),
    },
    { merge: true },
  );
}

/**
 * Define a quantidade exata (stepper da tela de edição).
 * Só use quando o usuário escolheu um número na tela: aqui o último a escrever
 * ganha, de propósito.
 */
export async function definirQuantidade(
  listId: string,
  itemId: string,
  qtd: number,
  db: Firestore = obterDb(),
): Promise<void> {
  await setDoc(
    refItem(listId, itemId, db),
    {
      qty: limparQtd(qtd),
      deleted: false,
      updatedAt: serverTimestamp(),
      clientUpdatedAt: Date.now(),
    },
    { merge: true },
  );
}

export interface DadosEditar {
  qtd?: number;
  unidade?: Unidade;
  observacao?: string;
  preco?: number | null;
  nome?: string;
}

export async function editarItem(
  listId: string,
  itemId: string,
  dados: DadosEditar,
  db: Firestore = obterDb(),
): Promise<void> {
  const payload: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
    clientUpdatedAt: Date.now(),
  };
  if (typeof dados.qtd === 'number') payload['qty'] = limparQtd(dados.qtd);
  if (dados.unidade) payload['unit'] = dados.unidade;
  if (typeof dados.observacao === 'string') payload['note'] = limparObservacao(dados.observacao);
  if (typeof dados.nome === 'string' && dados.nome.trim()) payload['name'] = limparNome(dados.nome);
  if (dados.preco === null) payload['price'] = 0;
  else if (typeof dados.preco === 'number' && Number.isFinite(dados.preco)) {
    payload['price'] = Math.max(0, Math.round(dados.preco * 100) / 100);
  }
  await setDoc(refItem(listId, itemId, db), payload, { merge: true });
}

/**
 * Marca/desmarca como comprado. Idempotente: marcar duas vezes é igual a
 * marcar uma, e desmarcar depois volta ao estado anterior sem efeito colateral.
 */
export async function marcarComprado(
  listId: string,
  itemId: string,
  comprado: boolean,
  autor: string | null,
  db: Firestore = obterDb(),
): Promise<void> {
  await setDoc(
    refItem(listId, itemId, db),
    {
      checked: comprado,
      checkedBy: comprado ? autor : null,
      deleted: false,
      updatedAt: serverTimestamp(),
      clientUpdatedAt: Date.now(),
    },
    { merge: true },
  );
}

/**
 * Remoção = soft delete. O documento continua lá (com `qty: 0`) para que
 * (a) o aparelho offline do outro lado não "ressuscite" o item ao sincronizar e
 * (b) adicionar de novo caia no mesmo documento e reviva corretamente.
 */
export async function removerItem(
  listId: string,
  itemId: string,
  db: Firestore = obterDb(),
): Promise<void> {
  await setDoc(
    refItem(listId, itemId, db),
    {
      deleted: true,
      qty: 0,
      checked: false,
      checkedBy: null,
      updatedAt: serverTimestamp(),
      clientUpdatedAt: Date.now(),
    },
    { merge: true },
  );
}

/** Desfazer da remoção: devolve a quantidade que havia antes. */
export async function restaurarItem(
  listId: string,
  itemId: string,
  qtd: number,
  comprado: boolean,
  db: Firestore = obterDb(),
): Promise<void> {
  await setDoc(
    refItem(listId, itemId, db),
    {
      deleted: false,
      qty: limparQtd(qtd) || 1,
      checked: comprado,
      updatedAt: serverTimestamp(),
      clientUpdatedAt: Date.now(),
    },
    { merge: true },
  );
}

// ---------------------------------------------------------------------------
// Limpar comprados / esvaziar lista  (+ histórico de frequentes)
// ---------------------------------------------------------------------------

const MAX_POR_LOTE = 400; // o limite do Firestore é 500 escritas por batch

/**
 * Tira os comprados da lista e soma +1 no histórico de cada um.
 * Devolve os itens afetados, para o "Desfazer".
 */
export async function limparComprados(
  listId: string,
  itens: Item[],
  db: Firestore = obterDb(),
): Promise<Item[]> {
  const comprados = itens.filter((i) => i.checked && !i.deleted);
  if (comprados.length === 0) return [];

  for (let inicio = 0; inicio < comprados.length; inicio += MAX_POR_LOTE) {
    const fatia = comprados.slice(inicio, inicio + MAX_POR_LOTE);
    const lote = writeBatch(db);
    const agora = Date.now();
    for (const item of fatia) {
      lote.set(
        refItem(listId, item.id, db),
        {
          deleted: true,
          checked: false,
          checkedBy: null,
          qty: 0,
          updatedAt: serverTimestamp(),
          clientUpdatedAt: agora,
        },
        { merge: true },
      );
      // `increment` no histórico: se dois aparelhos limparem offline, as duas
      // compras somam em vez de uma sobrescrever a outra.
      lote.set(
        doc(refHistorico(listId, db), item.id),
        {
          name: item.name,
          category: item.category,
          catalogId: item.catalogId,
          unit: item.unit,
          count: increment(1),
          lastAt: serverTimestamp(),
          clientLastAt: agora,
        },
        { merge: true },
      );
    }
    await lote.commit();
  }

  return comprados;
}

/** Esvazia a lista inteira (comprados ou não). Também alimenta o histórico. */
export async function esvaziarLista(
  listId: string,
  itens: Item[],
  db: Firestore = obterDb(),
): Promise<Item[]> {
  const ativos = itens.filter((i) => !i.deleted);
  if (ativos.length === 0) return [];

  for (let inicio = 0; inicio < ativos.length; inicio += MAX_POR_LOTE) {
    const fatia = ativos.slice(inicio, inicio + MAX_POR_LOTE);
    const lote = writeBatch(db);
    const agora = Date.now();
    for (const item of fatia) {
      lote.set(
        refItem(listId, item.id, db),
        {
          deleted: true,
          checked: false,
          checkedBy: null,
          qty: 0,
          updatedAt: serverTimestamp(),
          clientUpdatedAt: agora,
        },
        { merge: true },
      );
      if (item.checked) {
        lote.set(
          doc(refHistorico(listId, db), item.id),
          {
            name: item.name,
            category: item.category,
            catalogId: item.catalogId,
            unit: item.unit,
            count: increment(1),
            lastAt: serverTimestamp(),
            clientLastAt: agora,
          },
          { merge: true },
        );
      }
    }
    await lote.commit();
  }

  return ativos;
}

/** Desfazer de "limpar comprados" / "esvaziar lista". */
export async function restaurarVarios(
  listId: string,
  itens: Item[],
  db: Firestore = obterDb(),
): Promise<void> {
  for (let inicio = 0; inicio < itens.length; inicio += MAX_POR_LOTE) {
    const fatia = itens.slice(inicio, inicio + MAX_POR_LOTE);
    const lote = writeBatch(db);
    const agora = Date.now();
    for (const item of fatia) {
      lote.set(
        refItem(listId, item.id, db),
        {
          deleted: false,
          qty: limparQtd(item.qty) || 1,
          checked: item.checked,
          checkedBy: item.checkedBy,
          updatedAt: serverTimestamp(),
          clientUpdatedAt: agora,
        },
        { merge: true },
      );
      if (item.checked) {
        // Devolve a contagem somada no histórico ao limpar.
        lote.set(
          doc(refHistorico(listId, db), item.id),
          { count: increment(-1), clientLastAt: agora },
          { merge: true },
        );
      }
    }
    await lote.commit();
  }
}

// ---------------------------------------------------------------------------
// Produtos personalizados da família
// ---------------------------------------------------------------------------

export async function salvarProdutoPersonalizado(
  listId: string,
  nome: string,
  categoria: CategoriaId,
  unidade: Unidade,
  autor: string | null,
  db: Firestore = obterDb(),
): Promise<string> {
  const id = slug(nome);
  if (!id) throw new Error('Nome inválido.');
  await setDoc(
    doc(refPersonalizados(listId, db), id),
    {
      nome: limparNome(nome),
      categoria,
      unidadePadrao: unidade,
      sinonimos: [],
      criadoPor: autor,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
  return id;
}

export function lerPersonalizado(
  snap: QueryDocumentSnapshot<DocumentData>,
): ProdutoPersonalizado {
  const d = snap.data();
  return {
    id: snap.id,
    nome: typeof d['nome'] === 'string' ? (d['nome'] as string) : snap.id,
    categoria: categoriaValida(String(d['categoria'] ?? 'outros')),
    sinonimos: Array.isArray(d['sinonimos']) ? (d['sinonimos'] as string[]) : [],
    unidadePadrao: (typeof d['unidadePadrao'] === 'string' ? d['unidadePadrao'] : 'un') as Unidade,
    criadoPor: typeof d['criadoPor'] === 'string' ? (d['criadoPor'] as string) : undefined,
    createdAt: d['createdAt'] ?? null,
  };
}

// ---------------------------------------------------------------------------
// Histórico / frequentes
// ---------------------------------------------------------------------------

export function lerHistorico(snap: QueryDocumentSnapshot<DocumentData>): HistoricoItem {
  const d = snap.data();
  return {
    id: snap.id,
    name: typeof d['name'] === 'string' ? (d['name'] as string) : snap.id,
    category: categoriaValida(String(d['category'] ?? 'outros')),
    catalogId: typeof d['catalogId'] === 'string' ? (d['catalogId'] as string) : null,
    unit: (typeof d['unit'] === 'string' ? d['unit'] : 'un') as Unidade,
    count: typeof d['count'] === 'number' ? (d['count'] as number) : 0,
    lastAt: d['lastAt'] ?? null,
    clientLastAt: typeof d['clientLastAt'] === 'number' ? (d['clientLastAt'] as number) : 0,
  };
}

// ---------------------------------------------------------------------------
// Limpeza periódica (feita pelo próprio cliente — sem Cloud Functions)
// ---------------------------------------------------------------------------

/**
 * Apaga de verdade os itens que estão com `deleted: true` há mais de 30 dias.
 * Roda no cliente, em segundo plano, no máximo uma vez por dia por aparelho.
 * Só roda online: o `getDocs` com `source: default` já resolve pelo cache,
 * mas a exclusão só faz sentido quando dá para confirmar no servidor.
 */
export async function limparItensAntigos(
  listId: string,
  db: Firestore = obterDb(),
): Promise<number> {
  const corte = Date.now() - DIAS_ATE_LIMPEZA * 24 * 60 * 60 * 1000;
  const consulta = query(
    refItens(listId, db),
    where('deleted', '==', true),
    where('clientUpdatedAt', '<', corte),
    orderBy('clientUpdatedAt', 'asc'),
    limit(MAX_POR_LOTE),
  );

  const snap = await getDocs(consulta);
  if (snap.empty) return 0;

  const lote = writeBatch(db);
  for (const d of snap.docs) lote.delete(d.ref);
  await lote.commit();
  return snap.size;
}

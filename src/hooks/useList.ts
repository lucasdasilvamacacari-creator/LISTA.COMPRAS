/**
 * Hook principal: conecta os listeners em tempo real da lista aberta.
 *
 * Decisões:
 *  - Os listeners existem SÓ para a lista aberta. Trocar de lista desliga os
 *    antigos. Isso mantém o custo de leituras dentro do plano gratuito.
 *  - `includeMetadataChanges: true` é necessário para o indicador de "escrita
 *    pendente" por item (`metadata.hasPendingWrites`) atualizar sozinho.
 *  - Lemos TODOS os itens (inclusive os apagados) e filtramos no cliente: é
 *    uma coleção pequena (máx. 500 ativos) e assim o revive de item apagado
 *    funciona offline, porque o documento está no cache.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { onSnapshot, type Unsubscribe } from 'firebase/firestore';
import {
  lerHistorico,
  lerItem,
  lerLista,
  lerPersonalizado,
  refHistorico,
  refItens,
  refLista,
  refPersonalizados,
} from '@/lib/listRepo';
import { obterDb } from '@/lib/firebase';
import type { HistoricoItem, Item, Lista, ProdutoPersonalizado, StatusSync } from '@/types';

export interface EstadoLista {
  lista: Lista | null;
  /** Todos os documentos, incluindo apagados (necessário para o revive). */
  todosItens: Item[];
  /** O que aparece na tela: não apagados. */
  itens: Item[];
  personalizados: ProdutoPersonalizado[];
  historico: HistoricoItem[];
  carregando: boolean;
  /** `true` quando o documento da lista não existe no servidor (link errado). */
  naoEncontrada: boolean;
  erro: Error | null;
  /** Há escritas na fila esperando o servidor? */
  temEscritasPendentes: boolean;
  /** Os dados vieram do cache local (ou seja, ainda não falamos com o servidor). */
  doCache: boolean;
}

const ESTADO_INICIAL: EstadoLista = {
  lista: null,
  todosItens: [],
  itens: [],
  personalizados: [],
  historico: [],
  carregando: true,
  naoEncontrada: false,
  erro: null,
  temEscritasPendentes: false,
  doCache: true,
};

export function useList(listId: string | null): EstadoLista {
  const [lista, setLista] = useState<Lista | null>(null);
  const [todosItens, setTodosItens] = useState<Item[]>([]);
  const [personalizados, setPersonalizados] = useState<ProdutoPersonalizado[]>([]);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [naoEncontrada, setNaoEncontrada] = useState(false);
  const [erro, setErro] = useState<Error | null>(null);
  const [pendentesLista, setPendentesLista] = useState(false);
  const [pendentesItens, setPendentesItens] = useState(false);
  const [doCache, setDoCache] = useState(true);

  // Guarda os unsubscribes para garantir que a troca de lista desliga tudo.
  const inscricoesRef = useRef<Unsubscribe[]>([]);

  useEffect(() => {
    // Sempre desliga os listeners anteriores antes de abrir outros.
    for (const parar of inscricoesRef.current) parar();
    inscricoesRef.current = [];

    if (!listId) {
      setLista(null);
      setTodosItens([]);
      setPersonalizados([]);
      setHistorico([]);
      setCarregando(false);
      setNaoEncontrada(false);
      return;
    }

    setCarregando(true);
    setNaoEncontrada(false);
    setErro(null);
    setTodosItens([]);
    setPersonalizados([]);
    setHistorico([]);

    const db = obterDb();
    const opcoes = { includeMetadataChanges: true } as const;

    const pararLista = onSnapshot(
      refLista(listId, db),
      opcoes,
      (snap) => {
        setCarregando(false);
        setPendentesLista(snap.metadata.hasPendingWrites);
        setDoCache(snap.metadata.fromCache);
        if (snap.exists()) {
          setLista(lerLista(listId, snap.data()));
          setNaoEncontrada(false);
        } else {
          setLista(null);
          // Offline + cache vazio NÃO quer dizer "não existe": pode ser só a
          // primeira abertura sem rede. Só acusamos "não encontrada" quando o
          // servidor confirmou a ausência.
          setNaoEncontrada(!snap.metadata.fromCache);
        }
      },
      (e) => {
        setCarregando(false);
        setErro(e);
      },
    );

    const pararItens = onSnapshot(
      refItens(listId, db),
      opcoes,
      (snap) => {
        setTodosItens(snap.docs.map(lerItem));
        setPendentesItens(snap.metadata.hasPendingWrites);
      },
      (e) => setErro(e),
    );

    const pararPersonalizados = onSnapshot(
      refPersonalizados(listId, db),
      (snap) => setPersonalizados(snap.docs.map(lerPersonalizado)),
      (e) => setErro(e),
    );

    const pararHistorico = onSnapshot(
      refHistorico(listId, db),
      (snap) => setHistorico(snap.docs.map(lerHistorico).filter((h) => h.count > 0)),
      (e) => setErro(e),
    );

    inscricoesRef.current = [pararLista, pararItens, pararPersonalizados, pararHistorico];

    return () => {
      for (const parar of inscricoesRef.current) parar();
      inscricoesRef.current = [];
    };
  }, [listId]);

  const itens = useMemo(() => todosItens.filter((i) => !i.deleted), [todosItens]);

  return {
    lista,
    todosItens,
    itens,
    personalizados,
    historico,
    carregando,
    naoEncontrada,
    erro,
    temEscritasPendentes: pendentesLista || pendentesItens || todosItens.some((i) => i.pendente),
    doCache,
  };
}

/**
 * Status mostrado no cabeçalho.
 *
 * Preferimos a verdade do Firestore (`hasPendingWrites`) ao `navigator.onLine`:
 * é o que o usuário realmente quer saber — "minhas alterações já saíram daqui?".
 */
export function statusSync(
  online: boolean,
  temEscritasPendentes: boolean,
  doCache: boolean,
): StatusSync {
  if (!online) return 'offline';
  if (temEscritasPendentes || doCache) return 'sincronizando';
  return 'sincronizado';
}

export { ESTADO_INICIAL };

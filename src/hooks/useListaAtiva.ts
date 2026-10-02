/**
 * Resolve QUAL lista está aberta.
 *
 * Ordem de decisão:
 *   1. `?l=` na URL (é assim que o link compartilhado funciona)
 *   2. última lista aberta neste aparelho (localStorage)
 *   3. nenhuma → a UI oferece criar a primeira (exige internet)
 *
 * Importante: NUNCA criamos uma lista silenciosamente a partir de um id que
 * veio da URL. Se o id não existe no servidor, mostramos "Lista não encontrada" —
 * caso contrário, um link digitado errado criaria uma lista fantasma e a
 * família acharia que perdeu tudo.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  definirListaAtual,
  esquecerMinhaLista,
  obterListaAtual,
  obterMinhasListas,
  salvarMinhaLista,
} from '@/lib/armazenamentoLocal';
import { idListaValido, novoIdLista } from '@/lib/ids';
import { buscarLista, criarLista } from '@/lib/listRepo';
import type { ListaSalva } from '@/types';

const PARAMETRO = 'l';

export function lerIdDaUrl(): string | null {
  try {
    const valor = new URL(window.location.href).searchParams.get(PARAMETRO);
    return valor && idListaValido(valor) ? valor : null;
  } catch {
    return null;
  }
}

/** Atualiza a URL sem recarregar a página. */
function escreverIdNaUrl(listId: string, substituir = false): void {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get(PARAMETRO) === listId) return;
    url.searchParams.set(PARAMETRO, listId);
    // Limpa parâmetros de atalho do manifest depois de usados.
    url.searchParams.delete('acao');
    if (substituir) window.history.replaceState({}, '', url.toString());
    else window.history.pushState({}, '', url.toString());
  } catch {
    /* ambiente sem history API */
  }
}

/** URL completa para compartilhar esta lista. */
export function urlDaLista(listId: string): string {
  try {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set(PARAMETRO, listId);
    return url.toString();
  } catch {
    return `${window.location.origin}/?${PARAMETRO}=${listId}`;
  }
}

export interface UseListaAtiva {
  listId: string | null;
  salvas: ListaSalva[];
  /** `true` enquanto decidimos qual lista abrir. */
  resolvendo: boolean;
  /** Erro ao criar/entrar (não é o "não encontrada", que vem do useList). */
  erro: string | null;
  criar: (nome: string) => Promise<string>;
  entrar: (listId: string) => Promise<boolean>;
  abrir: (listId: string) => void;
  esquecer: (listId: string) => void;
  /** Mantém o nome em "Minhas listas" sincronizado com o do Firestore. */
  registrarNome: (listId: string, nome: string) => void;
}

export function useListaAtiva(): UseListaAtiva {
  const [listId, setListId] = useState<string | null>(null);
  const [salvas, setSalvas] = useState<ListaSalva[]>(() => obterMinhasListas());
  const [resolvendo, setResolvendo] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Decide a lista inicial e reage ao botão voltar do navegador.
  useEffect(() => {
    const resolver = (): void => {
      const daUrl = lerIdDaUrl();
      if (daUrl) {
        setListId(daUrl);
        definirListaAtual(daUrl);
      } else {
        const salva = obterListaAtual();
        if (salva && idListaValido(salva)) {
          setListId(salva);
          escreverIdNaUrl(salva, true);
        } else {
          setListId(null);
        }
      }
      setResolvendo(false);
    };

    resolver();
    window.addEventListener('popstate', resolver);
    return () => window.removeEventListener('popstate', resolver);
  }, []);

  const abrir = useCallback((novoId: string) => {
    setListId(novoId);
    definirListaAtual(novoId);
    escreverIdNaUrl(novoId);
    setSalvas(obterMinhasListas());
    setErro(null);
  }, []);

  const criar = useCallback(
    async (nome: string): Promise<string> => {
      setErro(null);
      const novoId = novoIdLista();
      try {
        // Exige internet: o documento precisa existir no servidor antes de o
        // link ser compartilhado.
        await criarLista(novoId, nome);
        salvarMinhaLista(novoId, nome || 'Mercado');
        abrir(novoId);
        return novoId;
      } catch (e) {
        console.error('[lista] falha ao criar:', e);
        setErro('criar');
        throw e;
      }
    },
    [abrir],
  );

  const entrar = useCallback(
    async (alvo: string): Promise<boolean> => {
      setErro(null);
      try {
        const lista = await buscarLista(alvo);
        if (!lista) {
          setErro('naoEncontrada');
          return false;
        }
        salvarMinhaLista(alvo, lista.name);
        abrir(alvo);
        return true;
      } catch (e) {
        console.error('[lista] falha ao entrar:', e);
        setErro('entrar');
        return false;
      }
    },
    [abrir],
  );

  const esquecer = useCallback(
    (alvo: string) => {
      esquecerMinhaLista(alvo);
      const restantes = obterMinhasListas();
      setSalvas(restantes);
      if (alvo === listId) {
        const proxima = restantes[0];
        if (proxima) abrir(proxima.id);
        else setListId(null);
      }
    },
    [listId, abrir],
  );

  const registrarNome = useCallback((alvo: string, nome: string) => {
    salvarMinhaLista(alvo, nome);
    setSalvas(obterMinhasListas());
  }, []);

  return { listId, salvas, resolvendo, erro, criar, entrar, abrir, esquecer, registrarNome };
}

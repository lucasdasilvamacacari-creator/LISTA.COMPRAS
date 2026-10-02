/**
 * Busca do catálogo, com Web Worker quando disponível.
 *
 * Estratégia:
 *  - Tenta subir o Worker. Se não der (navegador antigo, CSP, `file://`),
 *    cai para o motor na thread principal. A UI não muda em nada.
 *  - Debounce curto (90 ms): rápido o suficiente para parecer instantâneo,
 *    longo o suficiente para não buscar a cada tecla de quem digita rápido.
 *  - Ignora respostas de pedidos antigos (o `pedidoId` evita resultado
 *    "piscando" fora de ordem).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MotorBusca, produtoDaFamilia } from '@/lib/busca';
import { PREFIXO_PERSONALIZADO } from '@/lib/ids';
import { carregarCatalogo } from '@/data/catalog';
import type { PedidoWorker, RespostaWorker } from '@/workers/busca.worker';
import type { Produto, ProdutoPersonalizado, ResultadoBusca } from '@/types';

const DEBOUNCE_MS = 90;

export interface UseCatalogSearch {
  resultados: ResultadoBusca[];
  buscando: boolean;
  /** `true` quando o índice está pronto para buscar. */
  pronto: boolean;
  /** Reconhece vários itens de uma fala ("leite, ovos e pão"). */
  casarFala: (trechos: string[]) => Promise<Produto[]>;
  /** Resolve um id do catálogo para o produto completo. */
  obterProduto: (id: string) => Promise<Produto | undefined>;
}

export function useCatalogSearch(
  consulta: string,
  personalizados: ProdutoPersonalizado[],
  frequentes: string[],
): UseCatalogSearch {
  const [resultados, setResultados] = useState<ResultadoBusca[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [pronto, setPronto] = useState(false);

  const workerRef = useRef<Worker | null>(null);
  const motorRef = useRef<MotorBusca | null>(null);
  const pedidoRef = useRef(0);
  const ultimoAtendidoRef = useRef(0);
  const pendentesRef = useRef(new Map<number, (valor: Produto[]) => void>());

  // `frequentes` muda de identidade a cada render; usamos a versão serializada
  // como dependência para não recriar efeitos sem necessidade.
  const chaveFrequentes = frequentes.join(',');

  // --- Inicialização: Worker, com fallback para a thread principal ----------
  useEffect(() => {
    let vivo = true;

    async function fallbackLocal(): Promise<void> {
      const produtos = await carregarCatalogo();
      if (!vivo) return;
      motorRef.current = new MotorBusca(produtos);
      setPronto(true);
    }

    try {
      const worker = new Worker(new URL('../workers/busca.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = (evento: MessageEvent<RespostaWorker>) => {
        if (!vivo) return;
        const resposta = evento.data;
        if (resposta.tipo === 'pronto') {
          setPronto(true);
        } else if (resposta.tipo === 'resultados') {
          // Descarta respostas antigas que chegaram depois de uma mais nova.
          if (resposta.pedidoId < ultimoAtendidoRef.current) return;
          ultimoAtendidoRef.current = resposta.pedidoId;
          setResultados(resposta.resultados);
          setBuscando(false);
        } else if (resposta.tipo === 'falados') {
          pendentesRef.current.get(resposta.pedidoId)?.(resposta.produtos);
          pendentesRef.current.delete(resposta.pedidoId);
        } else {
          console.warn('[busca] worker falhou:', resposta.mensagem);
          setBuscando(false);
        }
      };

      worker.onerror = () => {
        // Worker morreu: segue na thread principal.
        console.warn('[busca] worker indisponível, buscando na thread principal.');
        worker.terminate();
        workerRef.current = null;
        void fallbackLocal();
      };

      workerRef.current = worker;
      const pedido: PedidoWorker = { tipo: 'iniciar' };
      worker.postMessage(pedido);
    } catch {
      void fallbackLocal();
    }

    return () => {
      vivo = false;
      workerRef.current?.terminate();
      workerRef.current = null;
      motorRef.current = null;
    };
  }, []);

  // --- Produtos criados pela família entram no mesmo índice -----------------
  const personalizadosSerial = useMemo(
    () => personalizados.map((p) => `${p.id}:${p.nome}`).join('|'),
    [personalizados],
  );

  useEffect(() => {
    if (!pronto || personalizados.length === 0) return;
    // O id precisa ser EXATAMENTE o que vira o itemId no Firestore
    // (`p_` + slug). Com um prefixo diferente, re-adicionar um item
    // personalizado pela busca criaria outro documento — e seria recusado
    // pelas regras, que só aceitam `^[a-z0-9-]+$` ou `^p_[a-z0-9-]+$`.
    const itens = personalizados.map((p) => ({
      id: `${PREFIXO_PERSONALIZADO}${p.id}`,
      nome: p.nome,
      categoria: p.categoria,
      unidadePadrao: p.unidadePadrao,
      sinonimos: p.sinonimos ?? [],
    }));

    const worker = workerRef.current;
    if (worker) {
      const pedido: PedidoWorker = { tipo: 'personalizados', itens };
      worker.postMessage(pedido);
    } else if (motorRef.current) {
      motorRef.current.adicionar(
        itens.map((i) =>
          produtoDaFamilia(i.id, i.nome, i.categoria, i.unidadePadrao, i.sinonimos),
        ),
      );
    }
    // `personalizadosSerial` já cobre a lista; `personalizados` é a fonte.
  }, [pronto, personalizadosSerial, personalizados]);

  // --- Busca com debounce ---------------------------------------------------
  useEffect(() => {
    const texto = consulta.trim();
    if (texto.length === 0) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    if (!pronto) {
      setBuscando(true);
      return;
    }

    setBuscando(true);
    const temporizador = window.setTimeout(() => {
      const id = ++pedidoRef.current;
      const worker = workerRef.current;
      if (worker) {
        const pedido: PedidoWorker = {
          tipo: 'buscar',
          pedidoId: id,
          consulta: texto,
          limite: 30,
          frequentes,
        };
        worker.postMessage(pedido);
      } else if (motorRef.current) {
        ultimoAtendidoRef.current = id;
        setResultados(
          motorRef.current.buscar(texto, { limite: 30, frequentes: new Set(frequentes) }),
        );
        setBuscando(false);
      }
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(temporizador);
    // `chaveFrequentes` representa `frequentes` de forma estável.
  }, [consulta, pronto, chaveFrequentes, frequentes]);

  const casarFala = useCallback(
    async (trechos: string[]): Promise<Produto[]> => {
      const worker = workerRef.current;
      if (worker) {
        const id = ++pedidoRef.current;
        return new Promise<Produto[]>((resolve) => {
          pendentesRef.current.set(id, resolve);
          const pedido: PedidoWorker = { tipo: 'falar', pedidoId: id, trechos, frequentes };
          worker.postMessage(pedido);
          // Rede de segurança: se o worker não responder, devolve vazio.
          window.setTimeout(() => {
            if (pendentesRef.current.has(id)) {
              pendentesRef.current.delete(id);
              resolve([]);
            }
          }, 4000);
        });
      }
      if (!motorRef.current) {
        const produtos = await carregarCatalogo();
        motorRef.current = new MotorBusca(produtos);
      }
      return motorRef.current.casarVarios(trechos, { frequentes: new Set(frequentes) });
    },
    [frequentes],
  );

  const obterProduto = useCallback(async (id: string): Promise<Produto | undefined> => {
    const { indicePorId } = await import('@/data/catalog');
    const indice = await indicePorId();
    return indice.get(id);
  }, []);

  return { resultados, buscando, pronto, casarFala, obterProduto };
}

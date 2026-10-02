/**
 * Web Worker da busca.
 *
 * Indexar ~1.500 produtos e rodar fuzzy a cada tecla roubaria frames da
 * thread principal. Aqui isso acontece fora dela, então a lista continua
 * rolando a 60 fps enquanto alguém digita.
 *
 * O hook `useCatalogSearch` cai para busca na thread principal se o navegador
 * não suportar Worker com módulos — o app nunca deixa de funcionar por isso.
 */
import { MotorBusca, produtoDaFamilia } from '@/lib/busca';
import { carregarCatalogo } from '@/data/catalog';
import type { Produto, ResultadoBusca } from '@/types';

export type PedidoWorker =
  | { tipo: 'iniciar' }
  | {
      tipo: 'personalizados';
      itens: {
        id: string;
        nome: string;
        categoria: Produto['categoria'];
        unidadePadrao: Produto['unidadePadrao'];
        sinonimos?: string[];
      }[];
    }
  | {
      tipo: 'buscar';
      pedidoId: number;
      consulta: string;
      limite?: number;
      frequentes?: string[];
    }
  | { tipo: 'falar'; pedidoId: number; trechos: string[]; frequentes?: string[] };

export type RespostaWorker =
  | { tipo: 'pronto'; total: number }
  | { tipo: 'resultados'; pedidoId: number; resultados: ResultadoBusca[] }
  | { tipo: 'falados'; pedidoId: number; produtos: Produto[] }
  | { tipo: 'erro'; mensagem: string };

let motor: MotorBusca | null = null;
/** ids dos produtos da família já adicionados, para não duplicar no índice. */
const idsDaFamilia = new Set<string>();

async function iniciar(): Promise<void> {
  if (motor) return;
  const produtos = await carregarCatalogo();
  motor = new MotorBusca(produtos);
}

function responder(mensagem: RespostaWorker): void {
  self.postMessage(mensagem);
}

self.onmessage = (evento: MessageEvent<PedidoWorker>) => {
  const pedido = evento.data;

  void (async () => {
    try {
      switch (pedido.tipo) {
        case 'iniciar': {
          await iniciar();
          responder({ tipo: 'pronto', total: motor?.total ?? 0 });
          break;
        }

        case 'personalizados': {
          await iniciar();
          const novos = pedido.itens
            .filter((item) => !idsDaFamilia.has(item.id))
            .map((item) => {
              idsDaFamilia.add(item.id);
              return produtoDaFamilia(
                item.id,
                item.nome,
                item.categoria,
                item.unidadePadrao,
                item.sinonimos ?? [],
              );
            });
          if (novos.length > 0) motor?.adicionar(novos);
          responder({ tipo: 'pronto', total: motor?.total ?? 0 });
          break;
        }

        case 'buscar': {
          await iniciar();
          const resultados =
            motor?.buscar(pedido.consulta, {
              limite: pedido.limite ?? 30,
              frequentes: new Set(pedido.frequentes ?? []),
            }) ?? [];
          responder({ tipo: 'resultados', pedidoId: pedido.pedidoId, resultados });
          break;
        }

        case 'falar': {
          await iniciar();
          const produtos =
            motor?.casarVarios(pedido.trechos, {
              frequentes: new Set(pedido.frequentes ?? []),
            }) ?? [];
          responder({ tipo: 'falados', pedidoId: pedido.pedidoId, produtos });
          break;
        }
      }
    } catch (erro) {
      responder({
        tipo: 'erro',
        mensagem: erro instanceof Error ? erro.message : String(erro),
      });
    }
  })();
};

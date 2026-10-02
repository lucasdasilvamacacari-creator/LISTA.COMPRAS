/**
 * "Comprados com frequência": o que a família mais compra, em chips de um toque.
 * Alimentado pela coleção `history`, que ganha +1 cada vez que um item comprado
 * sai da lista em "Limpar comprados".
 */
import { RotateCcw } from 'lucide-react';
import { t } from '@/i18n';
import type { HistoricoItem } from '@/types';

interface Props {
  historico: HistoricoItem[];
  /** ids já presentes na lista ativa — esses não aparecem aqui. */
  naLista: Set<string>;
  onAdicionar: (historico: HistoricoItem) => void;
  limite?: number;
}

export function Frequentes({ historico, naLista, onAdicionar, limite = 12 }: Props): JSX.Element | null {
  const sugestoes = historico
    .filter((h) => h.count > 0 && !naLista.has(h.id))
    .sort((a, b) => b.count - a.count || b.clientLastAt - a.clientLastAt)
    .slice(0, limite);

  if (sugestoes.length === 0) return null;

  return (
    <section aria-labelledby="titulo-frequentes">
      <h2
        id="titulo-frequentes"
        className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-base-500"
      >
        {t.lista.frequentesTitulo}
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {sugestoes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onAdicionar(item)}
            className="chip"
            aria-label={`${t.lista.frequentesAcao}: ${item.name}`}
          >
            <RotateCcw size={13} aria-hidden="true" className="text-base-500" />
            <span className="truncate">{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

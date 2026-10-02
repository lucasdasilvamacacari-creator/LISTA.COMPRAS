/** Contador "X de Y itens" com barra de progresso fina. */
import { t } from '@/i18n';

interface Props {
  feitos: number;
  total: number;
  /** Total estimado em reais (recurso opcional). */
  totalEstimado?: number | null;
}

export function Progresso({ feitos, total, totalEstimado }: Props): JSX.Element | null {
  if (total === 0) return null;
  const porcentagem = Math.round((feitos / total) * 100);

  return (
    <div className="px-1">
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <p className="text-sm font-medium text-base-700">{t.lista.progresso(feitos, total)}</p>
        {typeof totalEstimado === 'number' && totalEstimado > 0 && (
          <p className="text-sm text-base-500">
            {t.lista.totalEstimado}{' '}
            <span className="font-semibold text-base-700 tabular-nums">
              R$ {totalEstimado.toFixed(2).replace('.', ',')}
            </span>
          </p>
        )}
      </div>

      <div
        className="h-1 overflow-hidden rounded-full bg-base-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={feitos}
        aria-label={t.lista.progresso(feitos, total)}
      >
        <div
          className="h-full rounded-full bg-accent-500 transition-[width] duration-300 ease-out"
          style={{ width: `${porcentagem}%` }}
        />
      </div>
    </div>
  );
}

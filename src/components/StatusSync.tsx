/**
 * Indicador discreto de sincronização: ● Sincronizado / ● Sincronizando / ● Offline.
 * Fica no cabeçalho, pequeno, só para dar confiança de que nada se perdeu.
 */
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { t } from '@/i18n';
import type { StatusSync as Status } from '@/types';

const CONFIG = {
  sincronizado: { Icone: Cloud, cor: 'text-accent-600', rotulo: t.status.sincronizado },
  sincronizando: { Icone: RefreshCw, cor: 'text-warn', rotulo: t.status.sincronizando },
  offline: { Icone: CloudOff, cor: 'text-base-500', rotulo: t.status.offline },
} as const;

export function StatusSync({ status, compacto = false }: { status: Status; compacto?: boolean }): JSX.Element {
  const { Icone, cor, rotulo } = CONFIG[status];
  const detalhe = status === 'offline' ? t.status.offlineDetalhe : undefined;

  return (
    <div
      className={`flex items-center gap-1.5 text-xs font-medium ${cor}`}
      role="status"
      aria-live="polite"
      aria-label={detalhe ? `${rotulo}. ${detalhe}` : rotulo}
      title={detalhe ?? rotulo}
    >
      <Icone
        size={14}
        aria-hidden="true"
        className={status === 'sincronizando' ? 'motion-safe:animate-spin' : ''}
      />
      {!compacto && <span className="hidden sm:inline">{rotulo}</span>}
    </div>
  );
}

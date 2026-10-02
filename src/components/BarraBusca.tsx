/**
 * Barra de busca grande, no topo — a porta de entrada do app.
 * Prioridade absoluta é rapidez: digita, aparece, toca, está na lista.
 */
import { forwardRef } from 'react';
import { Mic, Search, X } from 'lucide-react';
import { t } from '@/i18n';

interface Props {
  valor: string;
  onChange: (valor: string) => void;
  /** Voz: quando `vozSuportada` é falso, o botão nem aparece. */
  vozSuportada: boolean;
  ouvindo: boolean;
  onVoz: () => void;
  onFocus?: () => void;
}

export const BarraBusca = forwardRef<HTMLInputElement, Props>(function BarraBusca(
  { valor, onChange, vozSuportada, ouvindo, onVoz, onFocus },
  ref,
) {
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 rounded-2xl border border-base-200 bg-base-0 px-3
                   shadow-soft transition focus-within:border-accent-500 focus-within:ring-2
                   focus-within:ring-accent-500/20"
      >
        <Search size={20} className="shrink-0 text-base-500" aria-hidden="true" />

        <input
          ref={ref}
          type="search"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          placeholder={t.busca.placeholder}
          aria-label={t.busca.placeholderCurto}
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-base outline-none
                     placeholder:text-base-500 [&::-webkit-search-cancel-button]:hidden"
        />

        {valor && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label={t.busca.limpar}
            className="tap -mr-1 rounded-xl text-base-500 hover:bg-base-100 hover:text-base-900"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}

        {vozSuportada && (
          <button
            type="button"
            onClick={onVoz}
            aria-label={ouvindo ? t.busca.vozOuvindo : t.busca.voz}
            aria-pressed={ouvindo}
            className={`tap -mr-1 rounded-xl transition ${
              ouvindo
                ? 'bg-danger/10 text-danger motion-safe:animate-pulse'
                : 'text-base-500 hover:bg-base-100 hover:text-base-900'
            }`}
          >
            <Mic size={19} aria-hidden="true" />
          </button>
        )}
      </div>

      {ouvindo && (
        <p className="mt-2 px-1 text-sm text-danger" role="status" aria-live="polite">
          {t.busca.vozOuvindo}
        </p>
      )}
    </div>
  );
});

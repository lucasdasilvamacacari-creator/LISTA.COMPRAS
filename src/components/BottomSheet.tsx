/**
 * Bottom sheet reutilizável.
 *
 * Mobile-first: abre de baixo, fecha arrastando para baixo, respeita a
 * safe-area do iPhone e devolve o foco a quem o abriu. Em telas grandes vira
 * um cartão centralizado.
 */
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { t } from '@/i18n';

interface Props {
  aberto: boolean;
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
  /** Conteúdo fixo no rodapé (botões de ação). */
  rodape?: React.ReactNode;
}

export function BottomSheet({ aberto, titulo, onFechar, children, rodape }: Props): JSX.Element {
  const painelRef = useRef<HTMLDivElement>(null);
  const focoAnteriorRef = useRef<HTMLElement | null>(null);

  // Esc fecha; o foco volta para onde estava; o fundo não rola.
  useEffect(() => {
    if (!aberto) return;

    focoAnteriorRef.current = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const aoTeclar = (evento: KeyboardEvent): void => {
      if (evento.key === 'Escape') {
        evento.stopPropagation();
        onFechar();
      }
      // Mantém o foco dentro do sheet (armadilha de foco simples).
      if (evento.key === 'Tab' && painelRef.current) {
        const focaveis = painelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focaveis.length === 0) return;
        const primeiro = focaveis[0] as HTMLElement;
        const ultimo = focaveis[focaveis.length - 1] as HTMLElement;
        if (!evento.shiftKey && document.activeElement === ultimo) {
          evento.preventDefault();
          primeiro.focus();
        } else if (evento.shiftKey && document.activeElement === primeiro) {
          evento.preventDefault();
          ultimo.focus();
        }
      }
    };

    document.addEventListener('keydown', aoTeclar, true);

    // Foca o primeiro campo útil (ou o painel) depois da animação de entrada.
    const temporizador = window.setTimeout(() => {
      const alvo =
        painelRef.current?.querySelector<HTMLElement>('[data-foco-inicial]') ?? painelRef.current;
      alvo?.focus();
    }, 120);

    return () => {
      document.removeEventListener('keydown', aoTeclar, true);
      document.body.style.overflow = overflowAnterior;
      window.clearTimeout(temporizador);
      focoAnteriorRef.current?.focus?.();
    };
  }, [aberto, onFechar]);

  return (
    <AnimatePresence>
      {aberto && (
        <>
          <motion.div
            key="fundo"
            className="fixed inset-0 z-40 bg-base-900/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onFechar}
            aria-hidden="true"
          />

          <motion.div
            key="painel"
            ref={painelRef}
            role="dialog"
            aria-modal="true"
            aria-label={titulo}
            tabIndex={-1}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-lg flex-col
                       rounded-t-3xl bg-base-0 shadow-sheet outline-none
                       sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              // Arrastou o suficiente (ou com velocidade) para baixo → fecha.
              if (info.offset.y > 110 || info.velocity.y > 600) onFechar();
            }}
          >
            {/* Alça de arraste */}
            <div className="flex shrink-0 justify-center pt-3 pb-1" aria-hidden="true">
              <div className="h-1.5 w-10 rounded-full bg-base-300" />
            </div>

            <header className="flex shrink-0 items-center gap-2 px-5 pb-3 pt-1">
              <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">{titulo}</h2>
              <button
                type="button"
                onClick={onFechar}
                aria-label={t.sheet.fechar}
                className="tap -mr-2 rounded-xl text-base-500 hover:bg-base-100 hover:text-base-900"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">{children}</div>

            {rodape && (
              <div className="shrink-0 border-t border-base-200 bg-base-0 px-5 pt-3 safe-bottom">
                {rodape}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

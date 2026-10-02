/**
 * Toasts com ação de desfazer.
 *
 * Toda operação destrutiva do app (remover, limpar comprados, esvaziar lista)
 * passa por aqui com um "Desfazer" — é mais rápido do que perguntar
 * "tem certeza?" para cada toque.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { t } from '@/i18n';
import { ContextoToast, type Toast } from '@/hooks/useToast';

export function ProvedorToast({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const proximoId = useRef(1);
  const temporizadores = useRef(new Map<number, number>());

  const fechar = useCallback((id: number) => {
    const temporizador = temporizadores.current.get(id);
    if (temporizador) window.clearTimeout(temporizador);
    temporizadores.current.delete(id);
    setToasts((atuais) => atuais.filter((toast) => toast.id !== id));
  }, []);

  const mostrar = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = proximoId.current++;
      const duracao = toast.duracaoMs ?? (toast.desfazer ? 6000 : 3200);
      // Só um toast por vez: dois empilhados no rodapé atrapalham o polegar.
      setToasts([{ ...toast, id }]);
      const temporizador = window.setTimeout(() => fechar(id), duracao);
      temporizadores.current.set(id, temporizador);
    },
    [fechar],
  );

  const erro = useCallback(
    (texto: string) => mostrar({ texto, tom: 'erro', duracaoMs: 5000 }),
    [mostrar],
  );

  const valor = useMemo(() => ({ mostrar, erro }), [mostrar, erro]);

  return (
    <ContextoToast.Provider value={valor}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
        role="status"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className={`pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl px-4 py-3 shadow-lift ${
                toast.tom === 'erro'
                  ? 'bg-danger text-white'
                  : 'bg-base-900 text-base-50 dark:bg-base-200 dark:text-base-900'
              }`}
            >
              <span className="min-w-0 flex-1 text-sm leading-snug">{toast.texto}</span>

              {toast.desfazer && (
                <button
                  type="button"
                  onClick={() => {
                    void toast.desfazer?.();
                    fechar(toast.id);
                  }}
                  className="shrink-0 rounded-lg px-2 py-1.5 text-sm font-semibold underline underline-offset-2 hover:opacity-80"
                >
                  {t.toast.desfazer}
                </button>
              )}

              <button
                type="button"
                onClick={() => fechar(toast.id)}
                aria-label={t.toast.fechar}
                className="shrink-0 rounded-lg p-1.5 hover:opacity-70"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ContextoToast.Provider>
  );
}

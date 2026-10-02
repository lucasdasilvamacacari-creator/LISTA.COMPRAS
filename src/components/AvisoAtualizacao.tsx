/**
 * Toast "Nova versão disponível".
 *
 * `registerType: 'prompt'` + `skipWaiting: false` garantem que a atualização
 * só acontece quando a pessoa aceita: um aparelho no meio da compra não tem
 * o app recarregado embaixo do dedo. A compatibilidade entre versões é
 * mantida pelo `schemaVersion` (campos novos sempre opcionais).
 */
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { t } from '@/i18n';

export function AvisoAtualizacao(): JSX.Element | null {
  const [precisaAtualizar, setPrecisaAtualizar] = useState(false);
  const [atualizar, setAtualizar] = useState<(() => Promise<void>) | null>(null);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    let cancelado = false;

    void (async () => {
      try {
        // Importado de forma dinâmica: em dev o virtual module não existe.
        const { registerSW } = await import('virtual:pwa-register');
        const atualizarSW = registerSW({
          immediate: true,
          onNeedRefresh() {
            if (!cancelado) setPrecisaAtualizar(true);
          },
          onOfflineReady() {
            // Nada a fazer: o app já abre offline sem avisar nada.
          },
          onRegisterError(erro: unknown) {
            console.warn('[pwa] falha ao registrar o service worker:', erro);
          },
        });
        if (!cancelado) setAtualizar(() => () => atualizarSW(true));
      } catch {
        // Sem service worker (dev, navegador antigo): o app funciona igual,
        // só não tem offline.
      }
    })();

    return () => {
      cancelado = true;
    };
  }, []);

  if (!precisaAtualizar || dispensado) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="fixed inset-x-3 top-[max(env(safe-area-inset-top),0.75rem)] z-[70] mx-auto
                   flex max-w-md items-center gap-3 rounded-2xl bg-accent-500 px-4 py-3 text-base-0 shadow-lift
                   dark:text-base-900"
        role="alert"
      >
        <RefreshCw size={18} className="shrink-0" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{t.atualizacao.titulo}</p>
          <p className="mt-0.5 text-xs leading-snug opacity-90">{t.atualizacao.texto}</p>
        </div>

        <button
          type="button"
          onClick={() => void atualizar?.()}
          className="shrink-0 rounded-xl bg-base-0/20 px-3 py-2 text-sm font-semibold hover:bg-base-0/30"
        >
          {t.atualizacao.acao}
        </button>

        <button
          type="button"
          onClick={() => setDispensado(true)}
          aria-label={t.atualizacao.depois}
          className="tap -mr-2 shrink-0 rounded-lg hover:bg-base-0/20"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

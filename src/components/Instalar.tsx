/**
 * Instalação do PWA.
 *
 * Android/Chrome: dá para capturar `beforeinstallprompt` e mostrar um banner.
 * iOS/Safari: NÃO existe prompt — nenhum site pode se instalar sozinho.
 * Então mostramos um mini-tutorial ilustrado, com "não mostrar de novo".
 */
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Plus, Share, X } from 'lucide-react';
import {
  bannerInstalarDispensado,
  dispensarBannerInstalar,
  dicaIosDispensada,
  dispensarDicaIos,
} from '@/lib/armazenamentoLocal';
import { ehIos, estaInstalado } from '@/lib/dispositivo';
import { useInstalacao } from '@/hooks/useInstalacao';
import { t } from '@/i18n';

/** Banner discreto de instalação (Android/desktop). */
export function BannerInstalar(): JSX.Element | null {
  const { podeInstalar, instalar } = useInstalacao();
  const [dispensado, setDispensado] = useState(() => bannerInstalarDispensado());

  if (!podeInstalar || dispensado) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="card flex items-center gap-3 p-3"
        role="region"
        aria-label={t.instalar.bannerTitulo}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
          <Download size={18} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight">{t.instalar.bannerTitulo}</p>
          <p className="mt-0.5 text-xs leading-snug text-base-500">{t.instalar.bannerTexto}</p>
        </div>

        <button type="button" onClick={() => void instalar()} className="btn-primary shrink-0 text-sm">
          {t.instalar.instalarAgora}
        </button>

        <button
          type="button"
          onClick={() => {
            dispensarBannerInstalar();
            setDispensado(true);
          }}
          aria-label={t.instalar.naoMostrarMais}
          className="tap shrink-0 rounded-lg text-base-500 hover:bg-base-100"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

/** Mini-tutorial do iOS — o único caminho possível no Safari. */
export function TutorialIos({ forcar = false }: { forcar?: boolean }): JSX.Element | null {
  const [dispensado, setDispensado] = useState(() => dicaIosDispensada());

  if (!forcar) {
    if (!ehIos() || estaInstalado() || dispensado) return null;
  }

  return (
    <section
      className="card p-4"
      aria-labelledby="titulo-ios"
    >
      <div className="mb-3 flex items-start gap-2">
        <h3 id="titulo-ios" className="min-w-0 flex-1 text-sm font-semibold">
          {t.instalar.iosTitulo}
        </h3>
        {!forcar && (
          <button
            type="button"
            onClick={() => {
              dispensarDicaIos();
              setDispensado(true);
            }}
            aria-label={t.instalar.naoMostrarMais}
            className="tap -mr-2 -mt-2 shrink-0 rounded-lg text-base-500 hover:bg-base-100"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <ol className="space-y-3">
        {t.instalar.iosPassos.map((passo, indice) => (
          <li key={passo} className="flex items-start gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-100 text-xs font-bold text-accent-700">
              {indice + 1}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-1.5 pt-1 text-sm leading-snug text-base-700">
              {passo}
              {/* Os ícones reproduzem o que a pessoa vê na barra do Safari. */}
              {indice === 0 && <Share size={15} className="shrink-0 text-accent-600" aria-hidden="true" />}
              {indice === 1 && <Plus size={15} className="shrink-0 text-accent-600" aria-hidden="true" />}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-4 border-t border-base-200 pt-3 text-xs leading-relaxed text-base-500">
        {t.instalar.iosObs}
      </p>
    </section>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { suportaWakeLock } from '@/lib/dispositivo';

interface SentinelaWakeLock {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (tipo: string, ouvinte: () => void) => void;
}

/**
 * "Manter tela ligada" do modo compras.
 * O navegador solta o lock sozinho quando a aba perde o foco, então
 * re-adquirimos ao voltar — senão a tela apaga no meio do corredor.
 */
export function useWakeLock(): {
  suportado: boolean;
  ativo: boolean;
  alternar: (ativar: boolean) => Promise<void>;
} {
  const [ativo, setAtivo] = useState(false);
  const desejadoRef = useRef(false);
  const sentinelaRef = useRef<SentinelaWakeLock | null>(null);
  const suportado = suportaWakeLock();

  const adquirir = useCallback(async () => {
    if (!suportado) return;
    try {
      const wakeLock = (navigator as unknown as {
        wakeLock: { request: (tipo: string) => Promise<SentinelaWakeLock> };
      }).wakeLock;
      const sentinela = await wakeLock.request('screen');
      sentinelaRef.current = sentinela;
      setAtivo(true);
      sentinela.addEventListener('release', () => {
        sentinelaRef.current = null;
        setAtivo(false);
      });
    } catch {
      setAtivo(false);
    }
  }, [suportado]);

  const alternar = useCallback(
    async (ativar: boolean) => {
      desejadoRef.current = ativar;
      if (ativar) {
        await adquirir();
      } else {
        try {
          await sentinelaRef.current?.release();
        } catch {
          /* já liberado */
        }
        sentinelaRef.current = null;
        setAtivo(false);
      }
    },
    [adquirir],
  );

  useEffect(() => {
    const aoVoltar = (): void => {
      if (document.visibilityState === 'visible' && desejadoRef.current && !sentinelaRef.current) {
        void adquirir();
      }
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar);
      void sentinelaRef.current?.release().catch(() => undefined);
    };
  }, [adquirir]);

  return { suportado, ativo, alternar };
}

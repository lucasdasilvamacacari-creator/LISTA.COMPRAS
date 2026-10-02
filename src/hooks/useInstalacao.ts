/**
 * Captura o `beforeinstallprompt` (Android/desktop) e expõe a ação de instalar.
 *
 * No iOS este evento NÃO existe: nenhum site pode se instalar sozinho lá, por
 * isso o caminho do iPhone é o mini-tutorial em `components/Instalar.tsx`.
 */
import { useEffect, useState } from 'react';
import { estaInstalado } from '@/lib/dispositivo';

interface EventoInstalacao extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface UseInstalacao {
  podeInstalar: boolean;
  instalado: boolean;
  instalar: () => Promise<void>;
}

export function useInstalacao(): UseInstalacao {
  const [evento, setEvento] = useState<EventoInstalacao | null>(null);
  const [instalado, setInstalado] = useState(() => estaInstalado());

  useEffect(() => {
    const aoPoder = (e: Event): void => {
      // Impede o mini-infobar do Chrome; mostramos nosso próprio banner.
      e.preventDefault();
      setEvento(e as EventoInstalacao);
    };
    const aoInstalar = (): void => {
      setInstalado(true);
      setEvento(null);
    };

    window.addEventListener('beforeinstallprompt', aoPoder);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoPoder);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  async function instalar(): Promise<void> {
    if (!evento) return;
    await evento.prompt();
    const escolha = await evento.userChoice;
    if (escolha.outcome === 'accepted') setInstalado(true);
    // O evento só pode ser consumido uma vez.
    setEvento(null);
  }

  return { podeInstalar: !!evento && !instalado, instalado, instalar };
}

import { useEffect, useState } from 'react';

/**
 * Online/offline do navegador.
 *
 * `navigator.onLine` mente com frequência (diz "online" em Wi-Fi sem internet),
 * por isso quem mostra "Sincronizado" de verdade é o `hasPendingWrites` dos
 * snapshots — veja `useStatusSync`. Este hook serve para o caso simples:
 * "o aparelho acha que tem rede?".
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const ficouOnline = (): void => setOnline(true);
    const ficouOffline = (): void => setOnline(false);
    window.addEventListener('online', ficouOnline);
    window.addEventListener('offline', ficouOffline);
    return () => {
      window.removeEventListener('online', ficouOnline);
      window.removeEventListener('offline', ficouOffline);
    };
  }, []);

  return online;
}

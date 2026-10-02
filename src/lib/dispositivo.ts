/** Detecções de plataforma e APIs opcionais. Nada aqui pode lançar exceção. */

export function ehIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ se identifica como Mac; o teste de toque desfaz o disfarce.
  return /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

export function ehSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
}

/** `true` quando o app está rodando instalado (standalone), não na aba. */
export function estaInstalado(): boolean {
  try {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/** Vibração curta de confirmação, quando o aparelho suporta. */
export function vibrar(padrao: number | number[] = 12): void {
  try {
    if ('vibrate' in navigator) navigator.vibrate(padrao);
  } catch {
    /* ignora */
  }
}

export function suportaWebShare(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

export function suportaWakeLock(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export function suportaVoz(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as Record<string, unknown>;
  return typeof w['SpeechRecognition'] === 'function' || typeof w['webkitSpeechRecognition'] === 'function';
}

/** Copia texto com fallback para navegadores sem Clipboard API. */
export async function copiar(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    /* cai no fallback */
  }
  try {
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** Monta a URL do WhatsApp (funciona no app e no web). */
export function urlWhatsApp(texto: string): string {
  return `https://wa.me/?text=${encodeURIComponent(texto)}`;
}

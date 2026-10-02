/**
 * Tema claro/escuro.
 * - 'auto' segue o `prefers-color-scheme` do sistema e reage a mudanças.
 * - O `theme-color` da barra do navegador é atualizado junto, para a UI do
 *   sistema combinar com o app (importante no PWA instalado).
 */
import { obterTema, definirTema, type PreferenciaTema } from './armazenamentoLocal';

const COR_CLARA = '#faf9f7';
const COR_ESCURA = '#17191a';

function sistemaEscuro(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

export function temaEfetivo(preferencia: PreferenciaTema = obterTema()): 'claro' | 'escuro' {
  if (preferencia === 'auto') return sistemaEscuro() ? 'escuro' : 'claro';
  return preferencia;
}

export function aplicarTema(preferencia: PreferenciaTema): void {
  const efetivo = temaEfetivo(preferencia);
  document.documentElement.setAttribute('data-theme', efetivo === 'escuro' ? 'dark' : 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', efetivo === 'escuro' ? COR_ESCURA : COR_CLARA);
}

export function salvarEAplicarTema(preferencia: PreferenciaTema): void {
  definirTema(preferencia);
  aplicarTema(preferencia);
}

/** Mantém o tema 'auto' em sincronia quando o sistema muda. Devolve o cancelador. */
export function observarTemaDoSistema(): () => void {
  try {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const aoMudar = (): void => {
      if (obterTema() === 'auto') aplicarTema('auto');
    };
    mq.addEventListener('change', aoMudar);
    return () => mq.removeEventListener('change', aoMudar);
  } catch {
    return () => undefined;
  }
}

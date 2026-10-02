/**
 * Tela mostrada quando o `.env` não foi preenchido.
 * Melhor uma instrução clara do que uma tela branca com erro no console.
 */
import { KeyRound } from 'lucide-react';
import { t } from '@/i18n';

export function TelaSemConfig(): JSX.Element {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-warn/10 text-warn">
        <KeyRound size={28} aria-hidden="true" />
      </span>
      <h1 className="text-lg font-semibold">{t.erro.firebaseNaoConfigurado}</h1>
      <p className="max-w-sm text-sm leading-relaxed text-base-500">
        {t.erro.firebaseNaoConfiguradoTexto}
      </p>
      <code className="rounded-lg bg-base-100 px-3 py-2 font-mono text-xs text-base-700">
        cp .env.example .env
      </code>
      <button type="button" onClick={() => window.location.reload()} className="btn-primary mt-2">
        {t.erro.recarregar}
      </button>
    </main>
  );
}

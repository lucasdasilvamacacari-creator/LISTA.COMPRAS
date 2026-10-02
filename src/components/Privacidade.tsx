/** Página curta de privacidade. O ponto principal: o link é a chave da lista. */
import { t } from '@/i18n';

export function Privacidade(): JSX.Element {
  return (
    <div className="space-y-4 pb-4">
      {t.privacidade.corpo.map((paragrafo) => (
        <p key={paragrafo} className="text-sm leading-relaxed text-base-700">
          {paragrafo}
        </p>
      ))}
    </div>
  );
}

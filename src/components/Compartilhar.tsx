/**
 * Tela "Compartilhar": o link é a chave da lista.
 *
 * Deixamos isso explícito na tela, não só no README: quem tem o link entra.
 * É o mesmo modelo de um documento com link, e a família precisa saber disso.
 */
import { useEffect, useState } from 'react';
import { Check, Copy, MessageCircle, QrCode, Share2 } from 'lucide-react';
import { copiar, suportaWebShare, urlWhatsApp } from '@/lib/dispositivo';
import { t } from '@/i18n';

interface Props {
  listId: string;
  nomeLista: string;
  url: string;
}

export function Compartilhar({ listId, nomeLista, url }: Props): JSX.Element {
  const [copiado, setCopiado] = useState<'link' | 'codigo' | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const mensagem = t.compartilhar.mensagemConvite(nomeLista, url);

  // QR Code sob demanda: a biblioteca vira um chunk só dessa tela.
  useEffect(() => {
    let vivo = true;
    void (async () => {
      try {
        const QRCode = (await import('qrcode')).default;
        const dataUrl = await QRCode.toDataURL(url, {
          width: 480,
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#1a1a19', light: '#ffffff' },
        });
        if (vivo) setQr(dataUrl);
      } catch {
        // Sem QR não é o fim do mundo: o link continua ali.
      }
    })();
    return () => {
      vivo = false;
    };
  }, [url]);

  async function copiarTexto(texto: string, qual: 'link' | 'codigo'): Promise<void> {
    if (await copiar(texto)) {
      setCopiado(qual);
      window.setTimeout(() => setCopiado(null), 2000);
    }
  }

  async function compartilharNativo(): Promise<void> {
    try {
      await navigator.share({ title: nomeLista, text: mensagem, url });
    } catch {
      // Usuário cancelou — nada a fazer.
    }
  }

  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-accent-50 px-4 py-3 text-sm leading-relaxed text-accent-700">
        {t.compartilhar.explicacao}
      </p>

      {/* Link */}
      <div>
        <label htmlFor="link-lista" className="mb-2 block text-sm font-medium text-base-700">
          {t.compartilhar.link}
        </label>
        <div className="flex gap-2">
          <input
            id="link-lista"
            type="text"
            value={url}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            className="field min-w-0 flex-1 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => void copiarTexto(url, 'link')}
            className="btn-outline shrink-0 px-3"
            aria-label={t.compartilhar.copiar}
          >
            {copiado === 'link' ? (
              <Check size={18} className="text-accent-600" aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
          </button>
        </div>
        {copiado === 'link' && (
          <p className="mt-1.5 text-xs text-accent-600" role="status">
            {t.compartilhar.copiado}
          </p>
        )}
      </div>

      {/* Ações */}
      <div className="grid gap-2 sm:grid-cols-2">
        <a
          href={urlWhatsApp(mensagem)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary justify-center gap-2"
        >
          <MessageCircle size={18} aria-hidden="true" />
          {t.compartilhar.whatsapp}
        </a>

        {suportaWebShare() && (
          <button
            type="button"
            onClick={() => void compartilharNativo()}
            className="btn-outline justify-center gap-2"
          >
            <Share2 size={18} aria-hidden="true" />
            {t.compartilhar.compartilharNativo}
          </button>
        )}
      </div>

      {/* QR Code */}
      <div>
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-base-700">
          <QrCode size={15} aria-hidden="true" />
          {t.compartilhar.qrTitulo}
        </h3>
        <div className="card flex items-center justify-center p-5">
          {qr ? (
            <img
              src={qr}
              alt={t.compartilhar.qrAlt}
              width={200}
              height={200}
              className="h-50 w-50 rounded-xl"
              style={{ imageRendering: 'pixelated' }}
            />
          ) : (
            <div className="skeleton h-[200px] w-[200px] rounded-xl" aria-hidden="true" />
          )}
        </div>
      </div>

      {/* Código, para quem prefere digitar */}
      <div>
        <label htmlFor="codigo-lista" className="mb-2 block text-sm font-medium text-base-700">
          {t.compartilhar.codigo}
        </label>
        <div className="flex gap-2">
          <input
            id="codigo-lista"
            type="text"
            value={listId}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            className="field min-w-0 flex-1 font-mono text-sm tracking-wide"
          />
          <button
            type="button"
            onClick={() => void copiarTexto(listId, 'codigo')}
            className="btn-outline shrink-0 px-3"
            aria-label={t.compartilhar.copiarCodigo}
          >
            {copiado === 'codigo' ? (
              <Check size={18} className="text-accent-600" aria-hidden="true" />
            ) : (
              <Copy size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

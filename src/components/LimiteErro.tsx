/**
 * Error boundary.
 *
 * Nenhuma tela quebrada: se um componente lançar, mostramos uma mensagem
 * calma deixando claro que a lista NÃO se perdeu (ela está no Firestore e no
 * cache local) e oferecemos recarregar.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { t } from '@/i18n';

interface Props {
  children: ReactNode;
}

interface Estado {
  erro: Error | null;
}

export class LimiteErro extends Component<Props, Estado> {
  override state: Estado = { erro: null };

  static getDerivedStateFromError(erro: Error): Estado {
    return { erro };
  }

  override componentDidCatch(erro: Error, info: ErrorInfo): void {
    // Sem analytics de terceiros: o erro fica só no console do aparelho.
    console.error('[app] erro não tratado:', erro, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.erro) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-lg font-semibold">{t.erro.telaQuebrou}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-base-500">{t.erro.telaQuebrouTexto}</p>
        <button type="button" onClick={() => window.location.reload()} className="btn-primary">
          {t.erro.recarregar}
        </button>
      </div>
    );
  }
}

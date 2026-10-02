/** Estado vazio: ilustração simples, uma frase que explica e uma ação. */
interface Props {
  Icone: React.ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>;
  titulo: string;
  texto?: string;
  acao?: { rotulo: string; onClick: () => void };
}

export function EstadoVazio({ Icone, titulo, texto, acao }: Props): JSX.Element {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-50 text-accent-500">
        <Icone size={28} aria-hidden={true} />
      </div>
      <h3 className="text-base font-semibold text-base-900">{titulo}</h3>
      {texto && <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-base-500">{texto}</p>}
      {acao && (
        <button type="button" onClick={acao.onClick} className="btn-primary mt-5">
          {acao.rotulo}
        </button>
      )}
    </div>
  );
}

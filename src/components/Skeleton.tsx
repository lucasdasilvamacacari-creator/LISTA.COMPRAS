/** Esqueletos de carregamento, para a primeira abertura não piscar vazia. */

export function LinhaSkeleton(): JSX.Element {
  return (
    <div className="flex items-center gap-3 px-4 py-3" aria-hidden="true">
      <div className="skeleton h-6 w-6 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="skeleton h-3.5 w-2/5" />
        <div className="skeleton h-2.5 w-1/4" />
      </div>
      <div className="skeleton h-6 w-10 rounded-lg" />
    </div>
  );
}

export function ListaSkeleton({ linhas = 5 }: { linhas?: number }): JSX.Element {
  return (
    <div className="card divide-y divide-base-200 overflow-hidden" aria-busy="true">
      {Array.from({ length: linhas }, (_, i) => (
        <LinhaSkeleton key={i} />
      ))}
    </div>
  );
}

export function GradeSkeleton({ blocos = 8 }: { blocos?: number }): JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-busy="true" aria-hidden="true">
      {Array.from({ length: blocos }, (_, i) => (
        <div key={i} className="skeleton h-24 rounded-2xl" />
      ))}
    </div>
  );
}

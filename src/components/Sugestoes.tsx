/**
 * Lista de sugestões da busca.
 *
 * Duas ações por linha:
 *  - tocar na linha  → abre o sheet (quantidade, unidade, observação)
 *  - tocar no "+"    → adiciona direto, sem sheet (o caminho rápido)
 *
 * No fim, se nada bateu, oferece criar o item personalizado com o texto digitado.
 */
import { Check, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { t, nomeCategoria } from '@/i18n';
import { LinhaSkeleton } from './Skeleton';
import type { ResultadoBusca } from '@/types';

interface Props {
  consulta: string;
  resultados: ResultadoBusca[];
  buscando: boolean;
  /** ids que já estão na lista (ativos), para marcar com o check. */
  naLista: Set<string>;
  onEscolher: (resultado: ResultadoBusca) => void;
  onAdicionarDireto: (resultado: ResultadoBusca) => void;
  onCriarPersonalizado: (texto: string) => void;
}

export function Sugestoes({
  consulta,
  resultados,
  buscando,
  naLista,
  onEscolher,
  onAdicionarDireto,
  onCriarPersonalizado,
}: Props): JSX.Element {
  const textoLimpo = consulta.trim();
  const mostrarSkeleton = buscando && resultados.length === 0;

  return (
    <div className="card overflow-hidden" role="region" aria-label={t.busca.resultados}>
      {mostrarSkeleton && (
        <div className="divide-y divide-base-200">
          <LinhaSkeleton />
          <LinhaSkeleton />
          <LinhaSkeleton />
        </div>
      )}

      {!mostrarSkeleton && (
        <ul className="divide-y divide-base-200">
          {resultados.map((resultado, indice) => {
            const { produto, origem } = resultado;
            const jaEsta = naLista.has(produto.id);

            return (
              <motion.li
                key={produto.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12, delay: Math.min(indice * 0.012, 0.1) }}
                className="flex items-stretch"
              >
                <button
                  type="button"
                  onClick={() => onEscolher(resultado)}
                  className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left
                             hover:bg-base-50 active:bg-base-100"
                  aria-label={`${produto.nome} — ${t.busca.abrirDetalhes}`}
                >
                  <span className="w-6 shrink-0 text-center text-lg" aria-hidden="true">
                    {produto.emoji ?? '•'}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate font-medium">{produto.nome}</span>
                      {origem === 'frequente' && (
                        <Sparkles size={13} className="shrink-0 text-accent-500" aria-label={t.busca.chipFrequentes} />
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-base-500">
                      {produto.subcategoria ?? nomeCategoria(produto.categoria)}
                    </span>
                  </span>

                  {jaEsta && (
                    <Check size={16} className="shrink-0 text-accent-600" aria-label={t.lista.titulo} />
                  )}
                </button>

                {/* Atalho: adiciona sem abrir o sheet. */}
                <button
                  type="button"
                  onClick={() => onAdicionarDireto(resultado)}
                  aria-label={`${t.busca.adicionarDireto}: ${produto.nome}`}
                  className="tap shrink-0 border-l border-base-200 px-3 text-accent-600
                             hover:bg-accent-50 active:bg-accent-100"
                >
                  <Plus size={20} aria-hidden="true" />
                </button>
              </motion.li>
            );
          })}

          {/* Criar item fora do catálogo */}
          {textoLimpo.length >= 2 && (
            <li>
              <button
                type="button"
                onClick={() => onCriarPersonalizado(textoLimpo)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left
                           text-accent-700 hover:bg-accent-50 active:bg-accent-100"
              >
                <Plus size={18} className="shrink-0" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {t.busca.criarPersonalizado(textoLimpo)}
                </span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

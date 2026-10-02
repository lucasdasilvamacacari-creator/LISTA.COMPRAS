/**
 * Tela "Explorar": grade de categorias → subcategorias → produtos.
 * Para quem prefere tocar a digitar (e para descobrir o que esqueceu).
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus } from 'lucide-react';
import { contagemPorCategoria, produtosDaCategoria } from '@/data/catalog';
import { GradeSkeleton, ListaSkeleton } from './Skeleton';
import { t, nomeCategoria } from '@/i18n';
import { CATEGORIAS, type CategoriaId, type Produto } from '@/types';

/** Um emoji por categoria, só para dar rosto à grade. */
const EMOJI: Record<CategoriaId, string> = {
  hortifruti: '🥬',
  acougue: '🥩',
  peixaria: '🐟',
  'frios-laticinios': '🧀',
  padaria: '🥖',
  mercearia: '🥫',
  'matinais-doces': '☕',
  'biscoitos-snacks': '🍪',
  bebidas: '🥤',
  congelados: '🧊',
  saudaveis: '🌱',
  'bebe-infantil': '🍼',
  higiene: '🧼',
  limpeza: '🧹',
  descartaveis: '🧻',
  pet: '🐕',
  churrasco: '🔥',
  outros: '📦',
};

interface Props {
  naLista: Set<string>;
  onEscolher: (produto: Produto) => void;
  onAdicionarDireto: (produto: Produto) => void;
}

export function Explorar({ naLista, onEscolher, onAdicionarDireto }: Props): JSX.Element {
  const [categoria, setCategoria] = useState<CategoriaId | null>(null);
  const [subcategoria, setSubcategoria] = useState<string | null>(null);
  const [contagens, setContagens] = useState<Map<CategoriaId, number> | null>(null);
  const [produtos, setProdutos] = useState<Produto[] | null>(null);

  useEffect(() => {
    let vivo = true;
    void contagemPorCategoria().then((mapa) => {
      if (vivo) setContagens(mapa);
    });
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => {
    if (!categoria) {
      setProdutos(null);
      return;
    }
    let vivo = true;
    setProdutos(null);
    void produtosDaCategoria(categoria).then((lista) => {
      if (vivo) setProdutos(lista);
    });
    return () => {
      vivo = false;
    };
  }, [categoria]);

  // --- Grade de categorias ---
  if (!categoria) {
    return (
      <div className="space-y-4">
        <p className="px-1 text-sm text-base-500">{t.explorar.subtitulo}</p>

        {!contagens ? (
          <GradeSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {CATEGORIAS.filter((c) => (contagens.get(c) ?? 0) > 0).map((c) => (
              <motion.button
                key={c}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setCategoria(c);
                  setSubcategoria(null);
                }}
                className="card flex flex-col items-start gap-1 p-4 text-left hover:border-accent-300 hover:bg-accent-50/40"
              >
                <span className="text-2xl" aria-hidden="true">
                  {EMOJI[c]}
                </span>
                <span className="mt-1 text-sm font-semibold leading-tight">{nomeCategoria(c)}</span>
                <span className="text-xs text-base-500">
                  {t.explorar.produtos(contagens.get(c) ?? 0)}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Produtos da categoria (filtrados por subcategoria, se escolhida) ---
  const subcategorias = produtos
    ? [...new Set(produtos.map((p) => p.subcategoria ?? 'Outros'))].sort((a, b) =>
        a.localeCompare(b, 'pt-BR'),
      )
    : [];

  const visiveis = produtos
    ? subcategoria
      ? produtos.filter((p) => (p.subcategoria ?? 'Outros') === subcategoria)
      : produtos
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (subcategoria) setSubcategoria(null);
            else setCategoria(null);
          }}
          className="tap -ml-2 rounded-xl text-base-700 hover:bg-base-100"
          aria-label={t.explorar.voltar}
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>
        <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">
          {subcategoria ?? nomeCategoria(categoria)}
        </h2>
      </div>

      {subcategorias.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSubcategoria(null)}
            className={`chip ${subcategoria === null ? 'chip-active' : ''}`}
          >
            {t.explorar.todas}
          </button>
          {subcategorias.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSubcategoria(sub)}
              className={`chip ${subcategoria === sub ? 'chip-active' : ''}`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {!produtos ? (
        <ListaSkeleton linhas={8} />
      ) : (
        <ul className="card divide-y divide-base-200 overflow-hidden">
          {visiveis.map((produto) => (
            <li key={produto.id} className="flex items-stretch">
              <button
                type="button"
                onClick={() => onEscolher(produto)}
                className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left hover:bg-base-50"
              >
                <span className="w-6 shrink-0 text-center text-lg" aria-hidden="true">
                  {produto.emoji ?? '•'}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{produto.nome}</span>
                {naLista.has(produto.id) && (
                  <span className="shrink-0 text-xs font-medium text-accent-600">✓</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onAdicionarDireto(produto)}
                aria-label={`${t.busca.adicionarDireto}: ${produto.nome}`}
                className="tap shrink-0 border-l border-base-200 px-3 text-accent-600 hover:bg-accent-50"
              >
                <Plus size={20} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

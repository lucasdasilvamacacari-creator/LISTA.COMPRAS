/**
 * A lista, agrupada por categoria na ordem dos corredores do mercado.
 *
 * Regras de ordenação:
 *  - grupos na ordem de `aisleOrder` (que a família edita arrastando);
 *  - DENTRO do grupo, ordem alfabética (previsível, não "último adicionado");
 *  - itens comprados saem dos grupos e vão para "No carrinho", no fim.
 */
import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { LinhaItem } from './LinhaItem';
import { t, nomeCategoria } from '@/i18n';
import type { CategoriaId, Item } from '@/types';

interface Props {
  itens: Item[];
  ordemCorredores: CategoriaId[];
  recolhidas: Set<string>;
  mostrarPrecos: boolean;
  onAlternarCategoria: (categoria: string) => void;
  onAlternarItem: (item: Item) => void;
  onEditar: (item: Item) => void;
  onRemover: (item: Item) => void;
}

interface Grupo {
  categoria: CategoriaId;
  itens: Item[];
}

export function ListaItens({
  itens,
  ordemCorredores,
  recolhidas,
  mostrarPrecos,
  onAlternarCategoria,
  onAlternarItem,
  onEditar,
  onRemover,
}: Props): JSX.Element {
  const { grupos, comprados } = useMemo(() => {
    const porCategoria = new Map<CategoriaId, Item[]>();
    const jaComprados: Item[] = [];

    for (const item of itens) {
      if (item.checked) {
        jaComprados.push(item);
        continue;
      }
      const atual = porCategoria.get(item.category);
      if (atual) atual.push(item);
      else porCategoria.set(item.category, [item]);
    }

    const ordenados: Grupo[] = [];
    for (const categoria of ordemCorredores) {
      const lista = porCategoria.get(categoria);
      if (!lista || lista.length === 0) continue;
      lista.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      ordenados.push({ categoria, itens: lista });
      porCategoria.delete(categoria);
    }
    // Categorias que não estão em `aisleOrder` (app mais novo do outro lado)
    // não podem desaparecer: entram no fim.
    for (const [categoria, lista] of porCategoria) {
      lista.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      ordenados.push({ categoria, itens: lista });
    }

    jaComprados.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    return { grupos: ordenados, comprados: jaComprados };
  }, [itens, ordemCorredores]);

  return (
    <div className="space-y-3">
      {grupos.map((grupo) => {
        const recolhida = recolhidas.has(grupo.categoria);
        const idPainel = `grupo-${grupo.categoria}`;

        return (
          <section key={grupo.categoria} className="card overflow-hidden">
            <h3>
              <button
                type="button"
                onClick={() => onAlternarCategoria(grupo.categoria)}
                aria-expanded={!recolhida}
                aria-controls={idPainel}
                aria-label={`${nomeCategoria(grupo.categoria)}, ${
                  recolhida ? t.lista.expandir : t.lista.recolher
                }`}
                className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-base-50"
              >
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`shrink-0 text-base-500 transition-transform ${
                    recolhida ? '-rotate-90' : ''
                  }`}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide text-base-700">
                  {nomeCategoria(grupo.categoria)}
                </span>
                <span className="shrink-0 text-xs text-base-500 tabular-nums">
                  {grupo.itens.length}
                </span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {!recolhida && (
                <motion.div
                  id={idPainel}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="divide-y divide-base-200 border-t border-base-200">
                    {grupo.itens.map((item) => (
                      <LinhaItem
                        key={item.id}
                        item={item}
                        mostrarPrecos={mostrarPrecos}
                        onAlternar={onAlternarItem}
                        onEditar={onEditar}
                        onRemover={onRemover}
                      />
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        );
      })}

      {/* No carrinho — sempre no fim */}
      {comprados.length > 0 && (
        <section className="card overflow-hidden">
          <h3>
            <button
              type="button"
              onClick={() => onAlternarCategoria('__comprados')}
              aria-expanded={!recolhidas.has('__comprados')}
              aria-controls="grupo-comprados"
              className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-base-50"
            >
              <ChevronDown
                size={16}
                aria-hidden="true"
                className={`shrink-0 text-base-500 transition-transform ${
                  recolhidas.has('__comprados') ? '-rotate-90' : ''
                }`}
              />
              <ShoppingCart size={14} className="shrink-0 text-accent-600" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-wide text-base-700">
                {t.lista.noCarrinho}
              </span>
              <span className="shrink-0 text-xs text-base-500 tabular-nums">
                {comprados.length}
              </span>
            </button>
          </h3>

          <AnimatePresence initial={false}>
            {!recolhidas.has('__comprados') && (
              <motion.div
                id="grupo-comprados"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <ul className="divide-y divide-base-200 border-t border-base-200">
                  {comprados.map((item) => (
                    <LinhaItem
                      key={item.id}
                      item={item}
                      mostrarPrecos={mostrarPrecos}
                      onAlternar={onAlternarItem}
                      onEditar={onEditar}
                      onRemover={onRemover}
                    />
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      )}
    </div>
  );
}

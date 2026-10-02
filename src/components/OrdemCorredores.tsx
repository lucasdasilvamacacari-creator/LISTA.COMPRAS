/**
 * Editor da ordem dos corredores, salva em `aisleOrder` e valendo para toda
 * a família.
 *
 * Arrastar é o gesto principal (Framer Motion `Reorder`), mas os botões
 * ↑ / ↓ existem porque arrastar com teclado ou leitor de tela não funciona —
 * acessibilidade não pode depender do gesto.
 */
import { useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { t, nomeCategoria } from '@/i18n';
import type { CategoriaId } from '@/types';

interface Props {
  ordem: CategoriaId[];
  onMudar: (ordem: CategoriaId[]) => void;
}

function Linha({
  categoria,
  indice,
  total,
  onMover,
}: {
  categoria: CategoriaId;
  indice: number;
  total: number;
  onMover: (de: number, para: number) => void;
}): JSX.Element {
  const controles = useDragControls();

  return (
    <Reorder.Item
      value={categoria}
      dragListener={false}
      dragControls={controles}
      className="flex touch-none items-center gap-1 border-b border-base-200 bg-base-0 last:border-b-0"
    >
      <span
        onPointerDown={(evento) => controles.start(evento)}
        className="tap cursor-grab text-base-300 active:cursor-grabbing"
        aria-hidden="true"
      >
        <GripVertical size={18} />
      </span>

      <span className="min-w-0 flex-1 truncate py-3 text-sm font-medium">
        {nomeCategoria(categoria)}
      </span>

      <button
        type="button"
        onClick={() => onMover(indice, indice - 1)}
        disabled={indice === 0}
        aria-label={`${t.compras.moverAcima}: ${nomeCategoria(categoria)}`}
        className="tap rounded-lg text-base-500 hover:bg-base-100 disabled:opacity-30"
      >
        <ChevronUp size={18} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onMover(indice, indice + 1)}
        disabled={indice === total - 1}
        aria-label={`${t.compras.moverAbaixo}: ${nomeCategoria(categoria)}`}
        className="tap mr-1 rounded-lg text-base-500 hover:bg-base-100 disabled:opacity-30"
      >
        <ChevronDown size={18} aria-hidden="true" />
      </button>
    </Reorder.Item>
  );
}

export function OrdemCorredores({ ordem, onMudar }: Props): JSX.Element {
  const [local, setLocal] = useState<CategoriaId[]>(ordem);

  function mover(de: number, para: number): void {
    if (para < 0 || para >= local.length) return;
    const copia = [...local];
    const [item] = copia.splice(de, 1);
    if (!item) return;
    copia.splice(para, 0, item);
    setLocal(copia);
    onMudar(copia);
  }

  return (
    <div>
      <p className="mb-3 text-sm text-base-500">{t.compras.ordemCorredoresAjuda}</p>
      <Reorder.Group
        axis="y"
        values={local}
        onReorder={(nova) => {
          setLocal(nova as CategoriaId[]);
          onMudar(nova as CategoriaId[]);
        }}
        className="card overflow-hidden"
      >
        {local.map((categoria, indice) => (
          <Linha
            key={categoria}
            categoria={categoria}
            indice={indice}
            total={local.length}
            onMover={mover}
          />
        ))}
      </Reorder.Group>
    </div>
  );
}

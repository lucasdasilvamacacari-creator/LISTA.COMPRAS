/**
 * Sheet de adicionar / editar item.
 *
 * O caminho rápido é o "+" na sugestão (que nem abre este sheet). Aqui a pessoa
 * ajusta quantidade, unidade e escreve a observação — que é livre, por conta
 * dela: marca, "sem lactose", "o mais maduro", tamanho.
 */
import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { t, nomeCategoria } from '@/i18n';
import { vibrar } from '@/lib/dispositivo';
import { UNIDADES, type CategoriaId, type Item, type Produto, type Unidade } from '@/types';

export interface DadosSheet {
  qtd: number;
  unidade: Unidade;
  observacao: string;
  preco?: number;
}

interface Props {
  aberto: boolean;
  /** Produto do catálogo (modo adicionar). */
  produto?: Produto | null;
  /** Nome livre, quando é um item personalizado novo. */
  nomeLivre?: string;
  categoriaLivre?: CategoriaId;
  /** Item existente (modo editar). */
  item?: Item | null;
  mostrarPrecos: boolean;
  onFechar: () => void;
  onConfirmar: (dados: DadosSheet) => void | Promise<void>;
}

/** Passo do stepper: unidades inteiras contam de 1 em 1; peso/volume, mais fino. */
function passoDa(unidade: Unidade): number {
  if (unidade === 'kg' || unidade === 'L') return 0.5;
  if (unidade === 'g' || unidade === 'ml') return 100;
  return 1;
}

function formatarQtd(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(valor < 1 ? 3 : 1).replace(/0+$/, '').replace(/\.$/, '');
}

export function SheetItem({
  aberto,
  produto,
  nomeLivre,
  categoriaLivre,
  item,
  mostrarPrecos,
  onFechar,
  onConfirmar,
}: Props): JSX.Element {
  const editando = !!item;
  const nome = item?.name ?? produto?.nome ?? nomeLivre ?? '';
  const categoria: CategoriaId = item?.category ?? produto?.categoria ?? categoriaLivre ?? 'outros';

  const [qtd, setQtd] = useState(1);
  const [unidade, setUnidade] = useState<Unidade>('un');
  const [observacao, setObservacao] = useState('');
  const [preco, setPreco] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Reinicia os campos sempre que o sheet abre para um item/produto diferente.
  useEffect(() => {
    if (!aberto) return;
    setQtd(item ? item.qty || 1 : 1);
    setUnidade(item?.unit ?? produto?.unidadePadrao ?? 'un');
    setObservacao(item?.note ?? '');
    setPreco(item?.price ? String(item.price).replace('.', ',') : '');
    setSalvando(false);
  }, [aberto, item, produto]);

  const passo = passoDa(unidade);

  function ajustar(delta: number): void {
    setQtd((atual) => {
      const novo = Math.round((atual + delta) * 1000) / 1000;
      return Math.min(999, Math.max(passo, novo));
    });
    vibrar(8);
  }

  async function confirmar(): Promise<void> {
    if (salvando) return;
    setSalvando(true);
    const precoNumero = Number(preco.replace(',', '.'));
    try {
      await onConfirmar({
        qtd,
        unidade,
        observacao: observacao.trim(),
        ...(mostrarPrecos && Number.isFinite(precoNumero) && precoNumero > 0
          ? { preco: precoNumero }
          : {}),
      });
      vibrar(14);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <BottomSheet
      aberto={aberto}
      titulo={editando ? t.sheet.tituloEditar : t.sheet.titulo}
      onFechar={onFechar}
      rodape={
        <div className="flex gap-2">
          <button type="button" onClick={onFechar} className="btn-outline flex-1">
            {t.sheet.cancelar}
          </button>
          <button
            type="button"
            onClick={() => void confirmar()}
            disabled={salvando || !nome}
            className="btn-primary flex-[2]"
          >
            {editando ? t.sheet.salvar : t.sheet.adicionar}
          </button>
        </div>
      }
    >
      <div className="space-y-6 pb-4">
        {/* Nome e categoria */}
        <div>
          <p className="text-xl font-semibold leading-tight">
            {produto?.emoji && <span className="mr-2">{produto.emoji}</span>}
            {nome}
          </p>
          <p className="mt-1 text-sm text-base-500">{nomeCategoria(categoria)}</p>
        </div>

        {/* Quantidade */}
        <div>
          <label className="mb-2 block text-sm font-medium text-base-700">
            {t.sheet.quantidade}
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => ajustar(-passo)}
              disabled={qtd <= passo}
              aria-label={t.sheet.diminuir}
              className="tap rounded-2xl border border-base-200 bg-base-0 text-base-900
                         hover:bg-base-100 active:scale-95 disabled:opacity-40"
            >
              <Minus size={20} aria-hidden="true" />
            </button>

            <output
              className="min-w-[4.5rem] text-center text-2xl font-semibold tabular-nums"
              aria-live="polite"
            >
              {formatarQtd(qtd)}
            </output>

            <button
              type="button"
              onClick={() => ajustar(passo)}
              aria-label={t.sheet.aumentar}
              className="tap rounded-2xl border border-base-200 bg-base-0 text-base-900
                         hover:bg-base-100 active:scale-95"
            >
              <Plus size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Unidade */}
        <div>
          <span className="mb-2 block text-sm font-medium text-base-700">{t.sheet.unidade}</span>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t.sheet.unidade}>
            {UNIDADES.map((u) => (
              <button
                key={u}
                type="button"
                role="radio"
                aria-checked={unidade === u}
                onClick={() => setUnidade(u)}
                className={`chip ${unidade === u ? 'chip-active' : ''}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Observação — totalmente livre */}
        <div>
          <label htmlFor="obs-item" className="mb-2 block text-sm font-medium text-base-700">
            {t.sheet.observacao}
          </label>
          <textarea
            id="obs-item"
            data-foco-inicial
            value={observacao}
            onChange={(e) => setObservacao(e.target.value.slice(0, 200))}
            placeholder={t.sheet.observacaoPlaceholder}
            rows={2}
            maxLength={200}
            className="field resize-none"
          />
          <p className="mt-1.5 flex justify-between text-xs text-base-500">
            <span>{t.sheet.observacaoAjuda}</span>
            <span className="tabular-nums">{observacao.length}/200</span>
          </p>
        </div>

        {/* Preço estimado (recurso opcional, desligado por padrão) */}
        {mostrarPrecos && (
          <div>
            <label htmlFor="preco-item" className="mb-2 block text-sm font-medium text-base-700">
              {t.sheet.preco}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-base-500">R$</span>
              <input
                id="preco-item"
                type="text"
                inputMode="decimal"
                value={preco}
                onChange={(e) => setPreco(e.target.value.replace(/[^\d,.]/g, ''))}
                placeholder={t.sheet.precoPlaceholder}
                className="field"
              />
            </div>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

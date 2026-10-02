/**
 * Uma linha da lista.
 *
 * - Tocar na linha marca/desmarca como comprado (é o gesto mais usado no mercado).
 * - Arrastar para a esquerda revela Editar e Remover.
 * - O ponto sutil ao lado do nome indica escrita ainda não confirmada pelo
 *   servidor (`metadata.hasPendingWrites`).
 */
import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, CloudOff, Pencil, Trash2 } from 'lucide-react';
import { t } from '@/i18n';
import { vibrar } from '@/lib/dispositivo';
import type { Item } from '@/types';

interface Props {
  item: Item;
  mostrarPrecos: boolean;
  onAlternar: (item: Item) => void;
  onEditar: (item: Item) => void;
  onRemover: (item: Item) => void;
}

const LARGURA_ACOES = 112;

function formatarQtd(valor: number): string {
  if (Number.isInteger(valor)) return String(valor);
  return valor.toFixed(valor < 1 ? 3 : 1).replace(/0+$/, '').replace(/\.$/, '');
}

export function LinhaItem({ item, mostrarPrecos, onAlternar, onEditar, onRemover }: Props): JSX.Element {
  const [aberto, setAberto] = useState(false);
  const x = useMotionValue(0);
  // As ações aparecem conforme o arraste, em vez de surgirem de uma vez.
  const opacidadeAcoes = useTransform(x, [-LARGURA_ACOES, -24, 0], [1, 0.35, 0]);

  return (
    <li
      className="relative overflow-hidden"
      onBlur={(evento) => {
        // Fecha quando o foco sai da linha inteira (e não ao pular de um
        // botão de ação para o outro).
        if (!evento.currentTarget.contains(evento.relatedTarget as Node | null)) {
          setAberto(false);
          void x.set(0);
        }
      }}
    >
      {/*
        Ações atrás da linha.

        Elas NÃO são escondidas de leitores de tela nem retiradas da ordem de
        tabulação: o swipe é só um atalho visual, e quem usa teclado ou leitor
        de tela precisa de um caminho real para editar e remover. Receber foco
        abre a linha, para a ação ficar visível para quem enxerga.
      */}
      <motion.div
        style={{ opacity: aberto ? 1 : opacidadeAcoes }}
        className="absolute inset-y-0 right-0 flex items-stretch"
      >
        <button
          type="button"
          onFocus={() => setAberto(true)}
          onClick={() => {
            setAberto(false);
            void x.set(0);
            onEditar(item);
          }}
          aria-label={`${t.lista.editar}: ${item.name}`}
          className="flex w-14 items-center justify-center bg-base-200 text-base-700"
        >
          <Pencil size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onFocus={() => setAberto(true)}
          onClick={() => {
            setAberto(false);
            void x.set(0);
            onRemover(item);
          }}
          aria-label={`${t.lista.remover}: ${item.name}`}
          className="flex w-14 items-center justify-center bg-danger text-white"
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </motion.div>

      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -LARGURA_ACOES, right: 0 }}
        dragElastic={{ left: 0.06, right: 0 }}
        onDragEnd={(_, info) => {
          const deveAbrir = info.offset.x < -LARGURA_ACOES / 2 || info.velocity.x < -400;
          setAberto(deveAbrir);
          void x.set(deveAbrir ? -LARGURA_ACOES : 0);
        }}
        animate={{ x: aberto ? -LARGURA_ACOES : 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 38 }}
        className="relative bg-base-0"
      >
        <div className="flex items-center gap-3 pr-3">
          {/* Checkbox grande: é onde o dedo acerta durante a compra. */}
          <button
            type="button"
            onClick={() => {
              vibrar(item.checked ? 8 : 14);
              onAlternar(item);
            }}
            role="checkbox"
            aria-checked={item.checked}
            aria-label={`${item.checked ? t.lista.desmarcar : t.lista.marcarComprado}: ${item.name}`}
            className="tap shrink-0 pl-3"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                item.checked
                  ? 'border-accent-500 bg-accent-500 text-base-0'
                  : 'border-base-300 bg-base-0'
              }`}
            >
              {item.checked && <Check size={14} strokeWidth={3} aria-hidden="true" />}
            </span>
          </button>

          {/* Texto */}
          <button
            type="button"
            onClick={() => {
              vibrar(item.checked ? 8 : 14);
              onAlternar(item);
            }}
            className="min-w-0 flex-1 py-3 text-left"
          >
            <span className="flex items-center gap-1.5">
              <span
                className={`truncate font-medium ${
                  item.checked ? 'text-base-500 line-through' : 'text-base-900'
                }`}
              >
                {item.name}
              </span>
              {item.pendente && (
                <CloudOff
                  size={12}
                  className="shrink-0 text-base-500"
                  aria-label={t.status.pendente}
                />
              )}
            </span>

            {(item.note || item.addedBy || (mostrarPrecos && item.price)) && (
              <span className="mt-0.5 block truncate text-xs text-base-500">
                {item.note && <span className="text-accent-700">{item.note}</span>}
                {item.note && (item.addedBy || (mostrarPrecos && item.price)) && ' · '}
                {mostrarPrecos && item.price ? `R$ ${item.price.toFixed(2).replace('.', ',')}` : ''}
                {mostrarPrecos && item.price && item.addedBy && ' · '}
                {item.addedBy && t.lista.adicionadoPor(item.addedBy)}
              </span>
            )}
          </button>

          {/* Quantidade */}
          <span
            className={`shrink-0 rounded-lg px-2 py-1 text-sm font-semibold tabular-nums ${
              item.checked ? 'text-base-500' : 'bg-base-100 text-base-700'
            }`}
          >
            {formatarQtd(item.qty)}
            <span className="ml-0.5 text-xs font-normal">{item.unit}</span>
          </span>
        </div>
      </motion.div>
    </li>
  );
}

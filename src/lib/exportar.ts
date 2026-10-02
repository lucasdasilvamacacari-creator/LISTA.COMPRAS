/**
 * Exportação da lista como texto, para WhatsApp e para a área de transferência.
 * Formato por categoria, com ☐ / ☑ — legível direto na conversa da família.
 */
import { nomeCategoria, t } from '@/i18n';
import type { CategoriaId, Item } from '@/types';

function formatarQtd(valor: number): string {
  return Number.isInteger(valor)
    ? String(valor)
    : valor.toFixed(valor < 1 ? 3 : 1).replace(/0+$/, '').replace(/\.$/, '');
}

function linhaDoItem(item: Item): string {
  const caixa = item.checked ? '☑' : '☐';
  const quantidade = `${formatarQtd(item.qty)} ${item.unit}`;
  const observacao = item.note ? ` (${item.note})` : '';
  return `${caixa} ${item.name} — ${quantidade}${observacao}`;
}

/**
 * Monta o texto da lista agrupado por categoria, na ordem dos corredores.
 * `incluirComprados` deixa de fora o que já foi para o carrinho.
 */
export function listaComoTexto(
  nomeLista: string,
  itens: Item[],
  ordemCorredores: CategoriaId[],
  incluirComprados = true,
): string {
  const visiveis = itens.filter((i) => !i.deleted && (incluirComprados || !i.checked));
  if (visiveis.length === 0) {
    return `${t.exportar.cabecalho(nomeLista)}\n\n${t.lista.vaziaTitulo}`;
  }

  const porCategoria = new Map<CategoriaId, Item[]>();
  for (const item of visiveis) {
    const atual = porCategoria.get(item.category);
    if (atual) atual.push(item);
    else porCategoria.set(item.category, [item]);
  }

  const partes: string[] = [t.exportar.cabecalho(nomeLista), ''];

  const categorias = [
    ...ordemCorredores.filter((c) => porCategoria.has(c)),
    ...[...porCategoria.keys()].filter((c) => !ordemCorredores.includes(c)),
  ];

  for (const categoria of categorias) {
    const lista = porCategoria.get(categoria);
    if (!lista || lista.length === 0) continue;
    lista.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    partes.push(`*${nomeCategoria(categoria).toUpperCase()}*`);
    for (const item of lista) partes.push(linhaDoItem(item));
    partes.push('');
  }

  const total = visiveis.length;
  const feitos = visiveis.filter((i) => i.checked).length;
  partes.push(`— ${t.lista.progresso(feitos, total)}`);

  return partes.join('\n').trim();
}

/** Soma dos preços estimados (quantidade × preço unitário). */
export function totalEstimado(itens: Item[]): number {
  return itens
    .filter((i) => !i.deleted && typeof i.price === 'number' && i.price > 0)
    .reduce((soma, i) => soma + (i.price ?? 0) * (i.qty || 1), 0);
}

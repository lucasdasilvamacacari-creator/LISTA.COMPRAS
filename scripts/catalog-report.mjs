#!/usr/bin/env node
/**
 * Relatório final do catálogo: contagem por categoria e subcategoria.
 *   npm run catalog:report
 */
import { carregarCatalogo, CATEGORIAS, METAS, META_TOTAL } from './catalog-lib.mjs';

const lotes = await carregarCatalogo();
const porCategoria = new Map();
const subPorCategoria = new Map();
let total = 0;

for (const { produtos } of lotes) {
  for (const p of produtos) {
    total++;
    porCategoria.set(p.categoria, (porCategoria.get(p.categoria) ?? 0) + 1);
    if (p.subcategoria) {
      if (!subPorCategoria.has(p.categoria)) subPorCategoria.set(p.categoria, new Map());
      const mapa = subPorCategoria.get(p.categoria);
      mapa.set(p.subcategoria, (mapa.get(p.subcategoria) ?? 0) + 1);
    }
  }
}

console.log('\n═══ Catálogo de produtos — relatório final ═══\n');
console.log('Categoria                Itens   Meta   Situação');
console.log('─'.repeat(52));
for (const categoria of CATEGORIAS) {
  const n = porCategoria.get(categoria) ?? 0;
  if (n === 0 && !METAS[categoria]) continue;
  const meta = METAS[categoria] ?? 0;
  const situacao = meta === 0 ? '—' : n >= meta ? `✓ +${n - meta}` : `✗ faltam ${meta - n}`;
  console.log(`${categoria.padEnd(24)}${String(n).padStart(5)}${String(meta || '—').padStart(7)}   ${situacao}`);
}
console.log('─'.repeat(52));
const metaSoma = Object.values(METAS).reduce((a, b) => a + b, 0);
console.log(`${'TOTAL'.padEnd(24)}${String(total).padStart(5)}${String(metaSoma).padStart(7)}   ${total >= metaSoma ? '✓' : `✗ faltam ${metaSoma - total}`}`);
console.log(`\nMeta mínima do projeto: ${META_TOTAL} produtos → ${total >= META_TOTAL ? 'atingida ✓' : `faltam ${META_TOTAL - total}`}`);

console.log('\nSubcategorias:');
for (const categoria of CATEGORIAS) {
  const mapa = subPorCategoria.get(categoria);
  if (!mapa) continue;
  const partes = [...mapa.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => `${s} (${n})`);
  console.log(`\n  ${categoria}:`);
  console.log('    ' + partes.join(', '));
}
console.log('');

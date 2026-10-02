#!/usr/bin/env node
/**
 * Valida o catálogo de produtos.
 *   npm run catalog:validate
 *
 * O que é verificado:
 *  - nenhum id duplicado (ids são usados como itemId no Firestore!)
 *  - campos obrigatórios presentes e com o tipo certo
 *  - `id` igual ao slug de si mesmo (estável, minúsculo, sem acento)
 *  - categoria válida e igual à categoria do arquivo
 *  - unidade válida
 *  - `sinonimos` preenchido (array com ao menos 1 texto útil)
 *  - sem nome duplicado dentro da mesma categoria
 *  - meta mínima de itens por categoria atingida
 *
 * Sai com código 1 se qualquer regra falhar, para travar o commit/CI.
 */
import { carregarCatalogo, CATEGORIAS, UNIDADES, METAS, META_TOTAL, slug, normalizar } from './catalog-lib.mjs';

const erros = [];
const avisos = [];

function erro(msg) {
  erros.push(msg);
}

async function main() {
  const lotes = await carregarCatalogo();
  if (lotes.length === 0) {
    console.log('Nenhum arquivo de catálogo ainda. Nada a validar.');
    return;
  }

  const idsVistos = new Map(); // id → arquivo
  const porCategoria = new Map();

  for (const { arquivo, produtos } of lotes) {
    const categoriaEsperada = arquivo.replace(/\.ts$/, '');

    if (!Array.isArray(produtos)) {
      erro(`${arquivo}: "produtos" não é um array.`);
      continue;
    }
    if (!CATEGORIAS.includes(categoriaEsperada)) {
      erro(`${arquivo}: nome do arquivo não corresponde a nenhuma categoria válida.`);
    }

    const nomesNaCategoria = new Map();

    produtos.forEach((p, indice) => {
      const onde = `${arquivo}[${indice}]`;

      // --- campos obrigatórios ---
      for (const campo of ['id', 'nome', 'categoria', 'unidadePadrao']) {
        if (typeof p?.[campo] !== 'string' || p[campo].trim() === '') {
          erro(`${onde}: campo obrigatório "${campo}" ausente ou vazio.`);
        }
      }
      if (typeof p?.id !== 'string' || typeof p?.nome !== 'string') return;

      // --- id estável ---
      if (p.id !== slug(p.id)) {
        erro(`${onde} (${p.nome}): id "${p.id}" não é um slug válido (esperado "${slug(p.id)}").`);
      }
      if (p.id.length > 80) erro(`${onde}: id "${p.id}" passa de 80 caracteres.`);
      if (idsVistos.has(p.id)) {
        erro(`id DUPLICADO "${p.id}": ${idsVistos.get(p.id)} e ${onde}.`);
      } else {
        idsVistos.set(p.id, onde);
      }

      // --- nome ---
      if (p.nome.length > 80) erro(`${onde}: nome passa de 80 caracteres.`);
      const nomeNormal = normalizar(p.nome);
      if (nomesNaCategoria.has(nomeNormal)) {
        erro(`${onde}: nome duplicado na categoria — "${p.nome}" já existe em ${nomesNaCategoria.get(nomeNormal)}.`);
      } else {
        nomesNaCategoria.set(nomeNormal, onde);
      }

      // --- categoria ---
      if (!CATEGORIAS.includes(p.categoria)) {
        erro(`${onde}: categoria inválida "${p.categoria}".`);
      } else if (p.categoria !== categoriaEsperada) {
        erro(`${onde}: categoria "${p.categoria}" não combina com o arquivo (${categoriaEsperada}).`);
      }

      // --- unidade ---
      if (!UNIDADES.includes(p.unidadePadrao)) {
        erro(`${onde}: unidadePadrao inválida "${p.unidadePadrao}".`);
      }

      // --- sinônimos ---
      if (!Array.isArray(p.sinonimos) || p.sinonimos.length === 0) {
        erro(`${onde} (${p.nome}): "sinonimos" precisa ser um array com ao menos 1 termo.`);
      } else {
        const limpos = p.sinonimos.filter((s) => typeof s === 'string' && s.trim().length >= 2);
        if (limpos.length === 0) {
          erro(`${onde} (${p.nome}): nenhum sinônimo útil (mínimo 2 caracteres).`);
        }
        const unicos = new Set(limpos.map(normalizar));
        if (unicos.size !== limpos.length) {
          avisos.push(`${onde} (${p.nome}): sinônimos repetidos.`);
        }
        if (unicos.has(normalizar(p.nome)) && limpos.length === 1) {
          avisos.push(`${onde} (${p.nome}): o único sinônimo é o próprio nome.`);
        }
      }

      // --- nenhum campo fora do formato previsto ---
      const CAMPOS = ['id', 'nome', 'categoria', 'subcategoria', 'sinonimos', 'unidadePadrao', 'emoji'];
      for (const campo of Object.keys(p)) {
        if (!CAMPOS.includes(campo)) {
          erro(`${onde} (${p.nome}): campo desconhecido "${campo}". Permitidos: ${CAMPOS.join(', ')}.`);
        }
      }

      // --- campos opcionais ---
      if (p.subcategoria !== undefined && typeof p.subcategoria !== 'string') {
        erro(`${onde}: "subcategoria" deve ser texto.`);
      }
      if (p.emoji !== undefined && typeof p.emoji !== 'string') {
        erro(`${onde}: "emoji" deve ser texto.`);
      }

      // --- sem marcas: heurística simples, só avisa ---
      if (/\b(nestl|coca|pepsi|danone|sadia|perdig|itamb|piracanjuba|omo|ariel|ype|yp[eê]|colgate|dove|seda|pantene|johnson)\b/i.test(p.nome)) {
        erro(`${onde}: o nome parece conter uma MARCA ("${p.nome}"). O catálogo é genérico.`);
      }

      const chave = p.categoria;
      porCategoria.set(chave, (porCategoria.get(chave) ?? 0) + 1);
    });
  }

  // --- metas mínimas ---
  let total = 0;
  for (const [categoria, meta] of Object.entries(METAS)) {
    const quantidade = porCategoria.get(categoria) ?? 0;
    total += quantidade;
    if (quantidade > 0 && quantidade < meta) {
      erro(`Categoria "${categoria}": ${quantidade} produtos, meta mínima é ${meta}.`);
    }
  }
  total += porCategoria.get('outros') ?? 0;

  // --- relatório ---
  console.log('\nProdutos por categoria:');
  for (const categoria of CATEGORIAS) {
    const quantidade = porCategoria.get(categoria) ?? 0;
    if (quantidade === 0 && !METAS[categoria]) continue;
    const meta = METAS[categoria];
    const estado = !meta ? ' ' : quantidade >= meta ? '✓' : '✗';
    const alvo = meta ? ` (meta ${meta})` : '';
    console.log(`  ${estado} ${categoria.padEnd(20)} ${String(quantidade).padStart(5)}${alvo}`);
  }
  console.log(`  ${'TOTAL'.padEnd(22)} ${String(total).padStart(5)} (meta ${META_TOTAL})`);

  if (avisos.length > 0) {
    console.log(`\nAvisos (${avisos.length}):`);
    for (const a of avisos.slice(0, 20)) console.log('  ·', a);
    if (avisos.length > 20) console.log(`  … e mais ${avisos.length - 20}.`);
  }

  if (erros.length > 0) {
    console.error(`\n✗ ${erros.length} erro(s) de validação:`);
    for (const e of erros.slice(0, 40)) console.error('  ·', e);
    if (erros.length > 40) console.error(`  … e mais ${erros.length - 40}.`);
    process.exit(1);
  }

  const categoriasCompletas = Object.keys(METAS).filter((c) => (porCategoria.get(c) ?? 0) > 0).length;
  console.log(
    `\n✓ Catálogo válido: ${total} produtos, ${categoriasCompletas}/${Object.keys(METAS).length} categorias geradas.`,
  );
  if (total < META_TOTAL) {
    console.log(`  (faltam ${META_TOTAL - total} produtos para a meta total de ${META_TOTAL})`);
  }
}

main().catch((erro) => {
  console.error('Falha na validação:', erro.message);
  process.exit(1);
});

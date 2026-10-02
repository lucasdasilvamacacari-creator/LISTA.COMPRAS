/**
 * Utilitários compartilhados pelos scripts de catálogo (validação e relatório).
 * Lê os arquivos .ts de `src/data/catalog/` SEM compilar TypeScript: os arquivos
 * têm um formato previsível, então extraímos os objetos com JSON5-ish parsing.
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIR_CATALOGO = path.join(RAIZ, 'src', 'data', 'catalog');

export const CATEGORIAS = [
  'hortifruti', 'acougue', 'peixaria', 'frios-laticinios', 'padaria',
  'mercearia', 'matinais-doces', 'biscoitos-snacks', 'bebidas', 'congelados',
  'saudaveis', 'bebe-infantil', 'higiene', 'limpeza', 'descartaveis',
  'pet', 'churrasco', 'outros',
];

export const UNIDADES = ['un', 'kg', 'g', 'L', 'ml', 'pacote', 'caixa', 'dúzia', 'bandeja'];

/** Meta mínima de produtos por categoria, conforme a especificação do projeto. */
export const METAS = {
  hortifruti: 150,
  acougue: 100,
  peixaria: 40,
  'frios-laticinios': 120,
  padaria: 60,
  mercearia: 250,
  'matinais-doces': 80,
  'biscoitos-snacks': 50,
  bebidas: 100,
  congelados: 70,
  saudaveis: 50,
  'bebe-infantil': 30,
  higiene: 80,
  limpeza: 80,
  descartaveis: 40,
  pet: 20,
  churrasco: 20,
};

export const META_TOTAL = 1200;

/** Converte o literal de array TS do arquivo em dados JavaScript. */
function extrairProdutos(fonte, arquivo) {
  const marcador = fonte.indexOf('export const produtos');
  if (marcador === -1) {
    throw new Error(`${arquivo}: não encontrei "export const produtos".`);
  }
  // Atenção: o primeiro "[" depois do marcador é o da ANOTAÇÃO de tipo
  // (`: Produto[] =`). O array de verdade começa depois do "=".
  const igual = fonte.indexOf('=', marcador);
  if (igual === -1) throw new Error(`${arquivo}: não encontrei a atribuição de produtos.`);
  const inicio = fonte.indexOf('[', igual);
  if (inicio === -1) throw new Error(`${arquivo}: array de produtos não encontrado.`);

  // Varredura balanceada, respeitando strings e comentários.
  let profundidade = 0;
  let fim = -1;
  let dentroDeString = null;
  for (let i = inicio; i < fonte.length; i++) {
    const c = fonte[i];
    const anterior = fonte[i - 1];
    if (dentroDeString) {
      if (c === dentroDeString && anterior !== '\\') dentroDeString = null;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      dentroDeString = c;
      continue;
    }
    if (c === '/' && fonte[i + 1] === '/') {
      const quebra = fonte.indexOf('\n', i);
      i = quebra === -1 ? fonte.length : quebra;
      continue;
    }
    if (c === '[') profundidade++;
    else if (c === ']') {
      profundidade--;
      if (profundidade === 0) {
        fim = i;
        break;
      }
    }
  }
  if (fim === -1) throw new Error(`${arquivo}: array de produtos não fecha.`);

  const literal = fonte.slice(inicio, fim + 1);
  // `new Function` é seguro aqui: o conteúdo é o nosso próprio catálogo,
  // versionado no repositório, e este script só roda localmente/no CI.
  try {
    return new Function(`"use strict"; return (${literal});`)();
  } catch (erro) {
    throw new Error(`${arquivo}: não consegui interpretar o array (${erro.message}).`);
  }
}

/** Lê todas as categorias e devolve { arquivo, produtos }. */
export async function carregarCatalogo() {
  const arquivos = (await readdir(DIR_CATALOGO))
    .filter((f) => f.endsWith('.ts') && !f.startsWith('_') && f !== 'index.ts')
    .sort();

  const lotes = [];
  for (const arquivo of arquivos) {
    const fonte = await readFile(path.join(DIR_CATALOGO, arquivo), 'utf8');
    lotes.push({ arquivo, produtos: extrairProdutos(fonte, arquivo) });
  }
  return lotes;
}

export function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slug(texto) {
  return normalizar(texto).replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

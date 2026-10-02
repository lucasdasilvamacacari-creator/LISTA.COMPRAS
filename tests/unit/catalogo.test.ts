/**
 * Validação do catálogo pelos testes (o mesmo que `npm run catalog:validate`
 * faz no terminal, mas aqui roda junto com a suíte, usando os módulos de verdade).
 */
import { beforeAll, describe, expect, it } from 'vitest';
import { carregarCatalogo, contagemPorCategoria, produtosDaCategoria, subcategoriasDe } from '@/data/catalog';
import { slug } from '@/lib/texto';
import { CATEGORIAS, UNIDADES, type Produto } from '@/types';

/** As mesmas metas mínimas da especificação do projeto. */
const METAS: Record<string, number> = {
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

let catalogo: Produto[];

beforeAll(async () => {
  catalogo = await carregarCatalogo();
}, 30_000);

describe('catálogo — tamanho', () => {
  it('tem pelo menos 1.200 produtos', () => {
    expect(catalogo.length).toBeGreaterThanOrEqual(1200);
  });

  it('atinge a meta mínima de cada categoria', async () => {
    const contagens = await contagemPorCategoria();
    for (const [categoria, meta] of Object.entries(METAS)) {
      const total = contagens.get(categoria as Produto['categoria']) ?? 0;
      expect(total, `categoria "${categoria}"`).toBeGreaterThanOrEqual(meta);
    }
  });
});

describe('catálogo — integridade dos ids', () => {
  it('não tem id duplicado', () => {
    // Crítico: o id vira o itemId no Firestore. Duplicata = itens se
    // sobrescrevendo entre si na lista da família.
    const vistos = new Map<string, string>();
    const duplicados: string[] = [];
    for (const p of catalogo) {
      const anterior = vistos.get(p.id);
      if (anterior) duplicados.push(`${p.id}: "${anterior}" e "${p.nome}"`);
      else vistos.set(p.id, p.nome);
    }
    expect(duplicados).toEqual([]);
  });

  it('todo id é um slug estável de si mesmo', () => {
    const invalidos = catalogo.filter((p) => p.id !== slug(p.id)).map((p) => p.id);
    expect(invalidos).toEqual([]);
  });

  it('nenhum id passa de 80 caracteres', () => {
    expect(catalogo.filter((p) => p.id.length > 80)).toEqual([]);
  });
});

describe('catálogo — campos obrigatórios', () => {
  it('todo produto tem nome, categoria válida e unidade válida', () => {
    for (const p of catalogo) {
      expect(p.nome.trim().length, p.id).toBeGreaterThan(0);
      expect(p.nome.length, p.id).toBeLessThanOrEqual(80);
      expect(CATEGORIAS, p.id).toContain(p.categoria);
      expect(UNIDADES, p.id).toContain(p.unidadePadrao);
    }
  });

  it('todo produto tem ao menos um sinônimo útil', () => {
    const sem = catalogo
      .filter((p) => !Array.isArray(p.sinonimos) || p.sinonimos.filter((s) => s.trim().length >= 2).length === 0)
      .map((p) => p.id);
    expect(sem).toEqual([]);
  });

  it('não repete nome dentro da mesma categoria', () => {
    const porCategoria = new Map<string, Set<string>>();
    const repetidos: string[] = [];
    for (const p of catalogo) {
      const chave = p.categoria;
      if (!porCategoria.has(chave)) porCategoria.set(chave, new Set());
      const nomes = porCategoria.get(chave) as Set<string>;
      const normal = p.nome.toLowerCase();
      if (nomes.has(normal)) repetidos.push(`${chave}: ${p.nome}`);
      nomes.add(normal);
    }
    expect(repetidos).toEqual([]);
  });
});

describe('catálogo — sem marcas', () => {
  it('nenhum nome de produto contém marca conhecida', () => {
    // O catálogo é genérico: a marca é escolha do usuário e vai na observação.
    const marcas =
      /\b(nestl|coca[- ]?cola|pepsi|danone|sadia|perdig|itamb|piracanjuba|omo|ariel|yp[eê]|colgate|dove|seda|pantene|johnson)\b/i;
    const comMarca = catalogo.filter((p) => marcas.test(p.nome)).map((p) => p.nome);
    expect(comMarca).toEqual([]);
  });
});

describe('catálogo — cobertura de variações esperadas', () => {
  const esperados: [string, string[]][] = [
    ['família do tomate', ['tomate', 'tomate-cereja', 'tomate-italiano', 'tomate-seco', 'molho-de-tomate', 'extrato-de-tomate']],
    ['tipos de arroz', ['arroz-branco', 'arroz-integral', 'arroz-parboilizado', 'arroz-arboreo', 'arroz-japones']],
    ['tipos de feijão', ['feijao-carioca', 'feijao-preto', 'feijao-branco', 'feijao-fradinho']],
    ['tipos de leite', ['leite-integral', 'leite-desnatado', 'leite-sem-lactose', 'leite-condensado']],
    ['tipos de queijo', ['queijo-mussarela', 'queijo-prato', 'queijo-minas-frescal', 'queijo-parmesao', 'queijo-coalho', 'queijo-gorgonzola']],
    ['cortes bovinos', ['picanha', 'alcatra', 'contrafile', 'coxao-mole', 'patinho', 'costela-bovina', 'carne-moida']],
    ['cortes de frango', ['peito-de-frango', 'coxa-de-frango', 'sobrecoxa-de-frango', 'asa-de-frango', 'coracao-de-frango']],
    ['tipos de banana', ['banana-prata', 'banana-nanica', 'banana-da-terra', 'banana-maca']],
    ['formatos de massa', ['macarrao-espaguete', 'macarrao-penne', 'macarrao-parafuso', 'macarrao-instantaneo']],
  ];

  it.each(esperados)('cobre a %s', (_rotulo, ids) => {
    const existentes = new Set(catalogo.map((p) => p.id));
    const faltando = ids.filter((id) => !existentes.has(id));
    expect(faltando).toEqual([]);
  });
});

describe('catálogo — acesso por categoria', () => {
  it('devolve produtos em ordem alfabética', async () => {
    const produtos = await produtosDaCategoria('pet');
    const nomes = produtos.map((p) => p.nome);
    expect(nomes).toEqual([...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR')));
  });

  it('agrupa subcategorias com contagem', async () => {
    const subs = await subcategoriasDe('hortifruti');
    expect(subs.length).toBeGreaterThan(3);
    expect(subs.every((s) => s.total > 0)).toBe(true);
    const soma = subs.reduce((total, s) => total + s.total, 0);
    expect(soma).toBe((await produtosDaCategoria('hortifruti')).length);
  });
});

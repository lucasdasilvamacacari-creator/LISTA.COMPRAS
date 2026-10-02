/**
 * Motor de busca do catálogo.
 *
 * Prioridade dos resultados (do mais para o menos relevante), como pedido:
 *   1. itens FREQUENTES da família (histórico de compras)
 *   2. correspondência EXATA do nome
 *   3. PREFIXO do nome ("arr" → "Arroz branco")
 *   4. sinônimo exato ou por prefixo ("refri" → "Refrigerante")
 *   5. palavra contida em qualquer posição
 *   6. FUZZY, tolerando erro de digitação ("arros" → "Arroz")
 *
 * Tudo é normalizado (sem acento, minúsculo), porque ninguém digita acento
 * com uma mão no corredor do mercado.
 *
 * O MiniSearch cuida do índice invertido; os pesos acima são aplicados em cima
 * do score dele, para que a ordem final seja a que faz sentido para a família.
 */
import MiniSearch from 'minisearch';
import { normalizar, distancia } from './texto';
import type { Produto, ResultadoBusca } from '@/types';

export interface OpcoesBusca {
  /** Máximo de resultados devolvidos. */
  limite?: number;
  /** ids (catalogId ou itemId) que a família compra com frequência → sobem. */
  frequentes?: Set<string>;
  /** ids que JÁ estão na lista → marcados, mas continuam aparecendo. */
  naLista?: Set<string>;
}

interface Documento {
  id: string;
  nome: string;
  nomeNormal: string;
  sinonimos: string;
  categoria: string;
  subcategoria: string;
}

const PESO_FREQUENTE = 1000;
const PESO_EXATO = 500;
const PESO_PREFIXO_NOME = 300;
const PESO_SINONIMO_EXATO = 250;
const PESO_SINONIMO_PREFIXO = 160;
const PESO_CONTEM = 90;
const PESO_FUZZY = 40;

export class MotorBusca {
  private readonly indice: MiniSearch<Documento>;
  private readonly produtos = new Map<string, Produto>();
  /** nome e sinônimos já normalizados, para não repetir o trabalho a cada tecla. */
  private readonly termos = new Map<string, { nome: string; sinonimos: string[] }>();

  constructor(produtos: Produto[]) {
    this.indice = new MiniSearch<Documento>({
      fields: ['nomeNormal', 'sinonimos', 'categoria', 'subcategoria'],
      storeFields: ['id'],
      idField: 'id',
      // Pesquisa já normalizada: o MiniSearch recebe texto sem acento.
      processTerm: (termo) => {
        const limpo = normalizar(termo);
        return limpo.length >= 1 ? limpo : null;
      },
      searchOptions: {
        boost: { nomeNormal: 3, sinonimos: 2, subcategoria: 1 },
        prefix: true,
        fuzzy: 0.2,
      },
    });

    this.adicionar(produtos);
  }

  /** Adiciona produtos ao índice (catálogo + personalizados da família). */
  adicionar(produtos: Produto[]): void {
    const novos: Documento[] = [];
    for (const p of produtos) {
      if (this.produtos.has(p.id)) continue;
      this.produtos.set(p.id, p);
      const sinonimos = p.sinonimos.map(normalizar).filter(Boolean);
      this.termos.set(p.id, { nome: normalizar(p.nome), sinonimos });
      novos.push({
        id: p.id,
        nome: p.nome,
        nomeNormal: normalizar(p.nome),
        sinonimos: sinonimos.join(' '),
        categoria: normalizar(p.categoria),
        subcategoria: normalizar(p.subcategoria ?? ''),
      });
    }
    if (novos.length > 0) this.indice.addAll(novos);
  }

  /** Remove um produto do índice (ex.: personalizado apagado). */
  remover(id: string): void {
    const produto = this.produtos.get(id);
    if (!produto) return;
    try {
      this.indice.discard(id);
    } catch {
      /* já não estava no índice */
    }
    this.produtos.delete(id);
    this.termos.delete(id);
  }

  obter(id: string): Produto | undefined {
    return this.produtos.get(id);
  }

  get total(): number {
    return this.produtos.size;
  }

  /**
   * Pontuação de um produto para a consulta.
   * Devolve 0 quando não combina de jeito nenhum.
   */
  private pontuar(id: string, consulta: string, scoreIndice: number): number {
    const termos = this.termos.get(id);
    if (!termos) return 0;

    let peso = 0;

    if (termos.nome === consulta) {
      peso = PESO_EXATO;
    } else if (termos.nome.startsWith(consulta)) {
      peso = PESO_PREFIXO_NOME;
    } else if (termos.sinonimos.includes(consulta)) {
      peso = PESO_SINONIMO_EXATO;
    } else if (termos.sinonimos.some((s) => s.startsWith(consulta))) {
      peso = PESO_SINONIMO_PREFIXO;
    } else if (
      termos.nome.includes(consulta) ||
      termos.sinonimos.some((s) => s.includes(consulta))
    ) {
      peso = PESO_CONTEM;
    } else {
      // Fuzzy: compara palavra por palavra, tolerando 1 erro em palavras
      // curtas e 2 em palavras longas.
      const limite = consulta.length <= 4 ? 1 : 2;
      const palavras = [termos.nome, ...termos.sinonimos].flatMap((t) => t.split(' '));
      const parecida = palavras.some((palavra) => distancia(palavra, consulta, limite) <= limite);
      if (parecida) peso = PESO_FUZZY;
    }

    if (peso === 0) return 0;
    // O score do MiniSearch entra como desempate dentro da mesma faixa.
    return peso + Math.min(scoreIndice, 30);
  }

  /** Busca principal. `consulta` pode vir com acento e maiúsculas. */
  buscar(consulta: string, opcoes: OpcoesBusca = {}): ResultadoBusca[] {
    const limpa = normalizar(consulta);
    const limite = opcoes.limite ?? 30;
    if (limpa.length === 0) return [];

    const frequentes = opcoes.frequentes ?? new Set<string>();
    const pontos = new Map<string, number>();

    // Candidatos do índice invertido.
    for (const achado of this.indice.search(limpa)) {
      const pontuacao = this.pontuar(achado.id as string, limpa, achado.score);
      if (pontuacao > 0) pontos.set(achado.id as string, pontuacao);
    }

    // Rede de segurança: consultas muito curtas (1–2 letras) e erros de
    // digitação que o MiniSearch não pegou passam por uma varredura direta.
    // ~1.500 itens é barato o suficiente para rodar a cada tecla.
    if (pontos.size < limite) {
      for (const id of this.produtos.keys()) {
        if (pontos.has(id)) continue;
        const pontuacao = this.pontuar(id, limpa, 0);
        if (pontuacao > 0) pontos.set(id, pontuacao);
      }
    }

    const resultados: ResultadoBusca[] = [];
    for (const [id, pontuacao] of pontos) {
      const produto = this.produtos.get(id);
      if (!produto) continue;
      const ehFrequente = frequentes.has(id);
      resultados.push({
        produto,
        origem: ehFrequente ? 'frequente' : 'catalogo',
        score: pontuacao + (ehFrequente ? PESO_FREQUENTE : 0),
      });
    }

    resultados.sort(
      (a, b) => b.score - a.score || a.produto.nome.localeCompare(b.produto.nome, 'pt-BR'),
    );
    return resultados.slice(0, limite);
  }

  /**
   * Casa uma fala com produtos ("leite, ovos e pão").
   * Devolve o melhor resultado de cada trecho reconhecido, sem repetir.
   */
  casarVarios(trechos: string[], opcoes: OpcoesBusca = {}): Produto[] {
    const achados: Produto[] = [];
    const vistos = new Set<string>();
    for (const trecho of trechos) {
      const [melhor] = this.buscar(trecho, { ...opcoes, limite: 1 });
      if (melhor && !vistos.has(melhor.produto.id)) {
        vistos.add(melhor.produto.id);
        achados.push(melhor.produto);
      }
    }
    return achados;
  }
}

/** Converte um produto personalizado da família no formato do catálogo. */
export function produtoDaFamilia(
  id: string,
  nome: string,
  categoria: Produto['categoria'],
  unidadePadrao: Produto['unidadePadrao'],
  sinonimos: string[] = [],
): Produto {
  return { id, nome, categoria, sinonimos: sinonimos.length > 0 ? sinonimos : [nome], unidadePadrao };
}

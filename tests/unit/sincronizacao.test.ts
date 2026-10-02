/**
 * Testes da lógica de sincronização — a parte crítica do projeto.
 *
 * Aqui NÃO usamos o Firestore: usamos um dublê que registra as escritas e
 * depois as APLICA do jeito que o servidor aplicaria (merge por campo e
 * `increment` somando). Assim conseguimos simular, de forma determinística:
 *
 *   - dois aparelhos OFFLINE adicionando "Leite" ao mesmo tempo
 *   - remover e adicionar de novo (soft delete + revive)
 *   - marcar/desmarcar comprado várias vezes (idempotência)
 *
 * Os testes de regras e de ponta a ponta com o Firestore de verdade ficam em
 * `tests/rules/` (emulador) e `tests/e2e/` (Playwright).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Dublê do Firestore
// ---------------------------------------------------------------------------

interface MarcaIncrement {
  __increment: number;
}

function ehIncrement(valor: unknown): valor is MarcaIncrement {
  return typeof valor === 'object' && valor !== null && '__increment' in valor;
}

const MARCA_SERVER_TS = '__serverTimestamp';

interface Escrita {
  caminho: string;
  dados: Record<string, unknown>;
}

/** Fila de escritas de um "aparelho", como a fila local do Firestore offline. */
class AparelhoFalso {
  readonly fila: Escrita[] = [];

  registrar(caminho: string, dados: Record<string, unknown>): void {
    this.fila.push({ caminho, dados });
  }
}

/** O "servidor": aplica as escritas na ordem, com merge e increment reais. */
class ServidorFalso {
  readonly documentos = new Map<string, Record<string, unknown>>();
  /** Ordem de chegada, só para inspeção nos testes. */
  readonly aplicadas: Escrita[] = [];

  aplicar(escrita: Escrita): void {
    this.aplicadas.push(escrita);
    const atual = this.documentos.get(escrita.caminho) ?? {};
    const novo = { ...atual };

    for (const [campo, valor] of Object.entries(escrita.dados)) {
      if (ehIncrement(valor)) {
        // É isso que faz duas adições offline SOMAREM em vez de uma
        // sobrescrever a outra.
        const anterior = typeof novo[campo] === 'number' ? (novo[campo] as number) : 0;
        novo[campo] = anterior + valor.__increment;
      } else if (valor === MARCA_SERVER_TS) {
        novo[campo] = Date.now();
      } else {
        // merge: last-write-wins por CAMPO (campos não citados ficam intactos).
        novo[campo] = valor;
      }
    }

    this.documentos.set(escrita.caminho, novo);
  }

  /** Sincroniza um aparelho: envia a fila dele na ordem. */
  sincronizar(aparelho: AparelhoFalso): void {
    for (const escrita of aparelho.fila) this.aplicar(escrita);
    aparelho.fila.length = 0;
  }

  ler(caminho: string): Record<string, unknown> | undefined {
    return this.documentos.get(caminho);
  }

  apagar(caminho: string): void {
    this.documentos.delete(caminho);
  }
}

// ---------------------------------------------------------------------------
// Mock do SDK do Firestore, para usar o listRepo de verdade
// ---------------------------------------------------------------------------

let servidor: ServidorFalso;
let aparelhoAtual: AparelhoFalso;

vi.mock('firebase/firestore', () => {
  return {
    collection: (_db: unknown, ...partes: string[]) => ({ caminho: partes.join('/') }),
    doc: (primeiro: unknown, ...partes: string[]) => {
      // doc(db, 'lists', id) ou doc(colecao, id)
      if (primeiro && typeof primeiro === 'object' && 'caminho' in primeiro) {
        return { caminho: `${(primeiro as { caminho: string }).caminho}/${partes.join('/')}` };
      }
      return { caminho: partes.join('/') };
    },
    increment: (quanto: number) => ({ __increment: quanto }),
    serverTimestamp: () => MARCA_SERVER_TS,
    setDoc: async (ref: { caminho: string }, dados: Record<string, unknown>) => {
      aparelhoAtual.registrar(ref.caminho, dados);
    },
    writeBatch: () => {
      const operacoes: Escrita[] = [];
      return {
        set: (ref: { caminho: string }, dados: Record<string, unknown>) => {
          operacoes.push({ caminho: ref.caminho, dados });
        },
        delete: (ref: { caminho: string }) => {
          operacoes.push({ caminho: ref.caminho, dados: { __apagar: true } });
        },
        commit: async () => {
          for (const operacao of operacoes) aparelhoAtual.registrar(operacao.caminho, operacao.dados);
        },
      };
    },
    getDoc: async () => ({ exists: () => false, data: () => undefined }),
    getDocs: async () => ({ empty: true, size: 0, docs: [] }),
    query: (...args: unknown[]) => args,
    where: (...args: unknown[]) => args,
    orderBy: (...args: unknown[]) => args,
    limit: (...args: unknown[]) => args,
  };
});

vi.mock('@/lib/firebase', () => ({
  obterDb: () => ({ __falso: true }),
}));

const {
  adicionarItem,
  ajustarQuantidade,
  marcarComprado,
  removerItem,
  restaurarItem,
  limparComprados,
  editarItem,
} = await import('@/lib/listRepo');

const LISTA = 'AbCdEfGhIjKlMnOpQrStUvWx';
const CAMINHO_LEITE = `lists/${LISTA}/items/leite-integral`;

const PRODUTO_LEITE = {
  id: 'leite-integral',
  nome: 'Leite integral',
  categoria: 'frios-laticinios' as const,
  sinonimos: ['leite'],
  unidadePadrao: 'L' as const,
};

/** Converte o documento do servidor no formato de `Item`, para reusar no repo. */
function comoItem(caminho: string): import('@/types').Item | null {
  const bruto = servidor.ler(caminho);
  if (!bruto) return null;
  return {
    id: caminho.split('/').pop() as string,
    catalogId: (bruto['catalogId'] as string | null) ?? null,
    name: (bruto['name'] as string) ?? '',
    category: (bruto['category'] as import('@/types').CategoriaId) ?? 'outros',
    qty: (bruto['qty'] as number) ?? 0,
    unit: (bruto['unit'] as import('@/types').Unidade) ?? 'un',
    note: (bruto['note'] as string) ?? '',
    checked: bruto['checked'] === true,
    checkedBy: (bruto['checkedBy'] as string | null) ?? null,
    addedBy: (bruto['addedBy'] as string | null) ?? null,
    createdAt: bruto['createdAt'] ?? null,
    updatedAt: bruto['updatedAt'] ?? null,
    clientUpdatedAt: (bruto['clientUpdatedAt'] as number) ?? 0,
    deleted: bruto['deleted'] === true,
  };
}

beforeEach(() => {
  servidor = new ServidorFalso();
  aparelhoAtual = new AparelhoFalso();
});

// ---------------------------------------------------------------------------

describe('anti-duplicação offline', () => {
  it('dois aparelhos offline adicionando "Leite" escrevem no MESMO documento', async () => {
    const celularA = new AparelhoFalso();
    const celularB = new AparelhoFalso();

    // Ambos offline, nenhum conhece o estado do outro (estadoAtual = null).
    aparelhoAtual = celularA;
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1, autor: 'Maria' }, null);

    aparelhoAtual = celularB;
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 2, autor: 'João' }, null);

    // Os dois escreveram no mesmo caminho — nada de "Leite" duplicado.
    expect(celularA.fila.every((e) => e.caminho === CAMINHO_LEITE)).toBe(true);
    expect(celularB.fila.every((e) => e.caminho === CAMINHO_LEITE)).toBe(true);

    // Reconectam, em qualquer ordem.
    servidor.sincronizar(celularA);
    servidor.sincronizar(celularB);

    // UM documento só, com as quantidades SOMADAS (1 + 2).
    const caminhosDeItem = [...servidor.documentos.keys()].filter((c) => c.includes('/items/'));
    expect(caminhosDeItem).toEqual([CAMINHO_LEITE]);
    expect(servidor.ler(CAMINHO_LEITE)?.['qty']).toBe(3);
    expect(servidor.ler(CAMINHO_LEITE)?.['name']).toBe('Leite integral');
  });

  it('o mesmo vale para item personalizado digitado de formas diferentes', async () => {
    const celularA = new AparelhoFalso();
    const celularB = new AparelhoFalso();

    aparelhoAtual = celularA;
    await adicionarItem(LISTA, { nome: 'Suco de caju', qtd: 1 }, null);

    aparelhoAtual = celularB;
    // Outro aparelho, outra grafia (minúscula e sem acento).
    await adicionarItem(LISTA, { nome: 'suco de caju', qtd: 1 }, null);

    servidor.sincronizar(celularA);
    servidor.sincronizar(celularB);

    const caminhos = [...servidor.documentos.keys()].filter((c) => c.includes('/items/'));
    expect(caminhos).toEqual([`lists/${LISTA}/items/p_suco-de-caju`]);
    expect(servidor.ler(caminhos[0] as string)?.['qty']).toBe(2);
  });

  it('nunca escreve a quantidade como número absoluto lido localmente', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 3 }, null);

    const escritaComQty = aparelhoAtual.fila.find((e) => 'qty' in e.dados);
    expect(escritaComQty).toBeDefined();
    // Se isso virar um número puro, dois aparelhos offline se sobrescrevem.
    expect(ehIncrement(escritaComQty?.dados['qty'])).toBe(true);
  });
});

describe('aumentar quantidade de item existente', () => {
  it('soma em vez de substituir, e o toast avisa', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 2 }, null);
    servidor.sincronizar(aparelhoAtual);
    expect(servidor.ler(CAMINHO_LEITE)?.['qty']).toBe(2);

    // Agora o aparelho JÁ conhece o item (vindo do snapshot).
    const resultado = await adicionarItem(
      LISTA,
      { produto: PRODUTO_LEITE, qtd: 1 },
      comoItem(CAMINHO_LEITE),
    );
    servidor.sincronizar(aparelhoAtual);

    expect(resultado.jaExistia).toBe(true);
    expect(resultado.incremento).toBe(1);
    expect(servidor.ler(CAMINHO_LEITE)?.['qty']).toBe(3);
  });

  it('ajustarQuantidade com delta negativo desfaz a soma', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 5 }, null);
    servidor.sincronizar(aparelhoAtual);

    await ajustarQuantidade(LISTA, 'leite-integral', -2);
    servidor.sincronizar(aparelhoAtual);

    expect(servidor.ler(CAMINHO_LEITE)?.['qty']).toBe(3);
  });
});

describe('soft delete e revive', () => {
  it('remover marca deleted e zera a quantidade, sem apagar o documento', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 3 }, null);
    servidor.sincronizar(aparelhoAtual);

    await removerItem(LISTA, 'leite-integral');
    servidor.sincronizar(aparelhoAtual);

    const documento = servidor.ler(CAMINHO_LEITE);
    // O documento CONTINUA existindo: é isso que impede o item de
    // "ressuscitar" quando o outro aparelho offline sincronizar.
    expect(documento).toBeDefined();
    expect(documento?.['deleted']).toBe(true);
    expect(documento?.['qty']).toBe(0);
  });

  it('adicionar de novo um item removido revive do ZERO (não soma o antigo)', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 5 }, null);
    servidor.sincronizar(aparelhoAtual);

    await removerItem(LISTA, 'leite-integral');
    servidor.sincronizar(aparelhoAtual);

    // Adiciona de novo, com o estado apagado em mãos.
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 2 }, comoItem(CAMINHO_LEITE));
    servidor.sincronizar(aparelhoAtual);

    const documento = servidor.ler(CAMINHO_LEITE);
    expect(documento?.['deleted']).toBe(false);
    expect(documento?.['checked']).toBe(false);
    // 2, e não 7: a quantidade recomeça do zero no revive.
    expect(documento?.['qty']).toBe(2);
  });

  it('adicionar de novo um item JÁ COMPRADO também revive do zero e desmarca', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 4 }, null);
    servidor.sincronizar(aparelhoAtual);

    await marcarComprado(LISTA, 'leite-integral', true, 'Maria');
    servidor.sincronizar(aparelhoAtual);
    expect(servidor.ler(CAMINHO_LEITE)?.['checked']).toBe(true);

    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1 }, comoItem(CAMINHO_LEITE));
    servidor.sincronizar(aparelhoAtual);

    const documento = servidor.ler(CAMINHO_LEITE);
    expect(documento?.['checked']).toBe(false);
    expect(documento?.['checkedBy']).toBe(null);
    expect(documento?.['qty']).toBe(1);
  });

  it('restaurarItem devolve a quantidade que havia antes (desfazer)', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 3 }, null);
    servidor.sincronizar(aparelhoAtual);

    await removerItem(LISTA, 'leite-integral');
    servidor.sincronizar(aparelhoAtual);

    await restaurarItem(LISTA, 'leite-integral', 3, false);
    servidor.sincronizar(aparelhoAtual);

    expect(servidor.ler(CAMINHO_LEITE)?.['deleted']).toBe(false);
    expect(servidor.ler(CAMINHO_LEITE)?.['qty']).toBe(3);
  });
});

describe('marcar comprado é idempotente', () => {
  it('marcar duas vezes é igual a marcar uma', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1 }, null);
    await marcarComprado(LISTA, 'leite-integral', true, 'Maria');
    await marcarComprado(LISTA, 'leite-integral', true, 'Maria');
    servidor.sincronizar(aparelhoAtual);

    const documento = servidor.ler(CAMINHO_LEITE);
    expect(documento?.['checked']).toBe(true);
    expect(documento?.['qty']).toBe(1); // a quantidade não foi afetada
  });

  it('desmarcar e remarcar volta ao mesmo estado', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 2 }, null);
    servidor.sincronizar(aparelhoAtual);

    for (const valor of [true, false, true, false, true]) {
      await marcarComprado(LISTA, 'leite-integral', valor, 'Maria');
      servidor.sincronizar(aparelhoAtual);
    }

    const documento = servidor.ler(CAMINHO_LEITE);
    expect(documento?.['checked']).toBe(true);
    expect(documento?.['checkedBy']).toBe('Maria');
    expect(documento?.['qty']).toBe(2);
  });

  it('dois aparelhos marcando o mesmo item offline convergem sem duplicar', async () => {
    const celularA = new AparelhoFalso();
    const celularB = new AparelhoFalso();

    aparelhoAtual = celularA;
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1 }, null);
    servidor.sincronizar(celularA);

    aparelhoAtual = celularA;
    await marcarComprado(LISTA, 'leite-integral', true, 'Maria');
    aparelhoAtual = celularB;
    await marcarComprado(LISTA, 'leite-integral', true, 'João');

    servidor.sincronizar(celularA);
    servidor.sincronizar(celularB);

    // Último a sincronizar ganha o campo checkedBy — mas o item é um só e
    // está comprado, que é o que importa para a família.
    const documento = servidor.ler(CAMINHO_LEITE);
    expect(documento?.['checked']).toBe(true);
    expect([...servidor.documentos.keys()].filter((c) => c.includes('/items/'))).toEqual([
      CAMINHO_LEITE,
    ]);
  });
});

describe('observação (last-write-wins por campo, com concatenação)', () => {
  it('concatena quando já existe texto diferente no cache local', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1, observacao: 'marca X' }, null);
    servidor.sincronizar(aparelhoAtual);
    expect(servidor.ler(CAMINHO_LEITE)?.['note']).toBe('marca X');

    // Outra pessoa pede "sem lactose", com o texto anterior visível no cache.
    await adicionarItem(
      LISTA,
      { produto: PRODUTO_LEITE, qtd: 1, observacao: 'sem lactose' },
      comoItem(CAMINHO_LEITE),
    );
    servidor.sincronizar(aparelhoAtual);

    // Os dois pedidos sobrevivem.
    expect(servidor.ler(CAMINHO_LEITE)?.['note']).toBe('marca X / sem lactose');
  });

  it('não duplica quando o texto novo já está contido no antigo', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1, observacao: 'sem lactose' }, null);
    servidor.sincronizar(aparelhoAtual);

    await adicionarItem(
      LISTA,
      { produto: PRODUTO_LEITE, qtd: 1, observacao: 'Sem Lactose' },
      comoItem(CAMINHO_LEITE),
    );
    servidor.sincronizar(aparelhoAtual);

    expect(servidor.ler(CAMINHO_LEITE)?.['note']).toBe('sem lactose');
  });

  it('offline simultâneo resulta em last-write-wins (comportamento documentado)', async () => {
    const celularA = new AparelhoFalso();
    const celularB = new AparelhoFalso();

    aparelhoAtual = celularA;
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1 }, null);
    servidor.sincronizar(celularA);

    // Nenhum dos dois vê a observação do outro (ambos offline ao mesmo tempo).
    const estadoCompartilhado = comoItem(CAMINHO_LEITE);

    aparelhoAtual = celularA;
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1, observacao: 'marca X' }, estadoCompartilhado);
    aparelhoAtual = celularB;
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1, observacao: 'bem gelado' }, estadoCompartilhado);

    servidor.sincronizar(celularA);
    servidor.sincronizar(celularB);

    // O último a chegar ganha na observação — mas a QUANTIDADE soma os dois.
    expect(servidor.ler(CAMINHO_LEITE)?.['note']).toBe('bem gelado');
    expect(servidor.ler(CAMINHO_LEITE)?.['qty']).toBe(3);
  });

  it('editar observação substitui de propósito (a pessoa escolheu na tela)', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1, observacao: 'marca X' }, null);
    servidor.sincronizar(aparelhoAtual);

    await editarItem(LISTA, 'leite-integral', { observacao: 'qualquer marca' });
    servidor.sincronizar(aparelhoAtual);

    expect(servidor.ler(CAMINHO_LEITE)?.['note']).toBe('qualquer marca');
  });
});

describe('limpar comprados alimenta o histórico', () => {
  it('soma +1 no histórico de cada item comprado e some da lista', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 2 }, null);
    servidor.sincronizar(aparelhoAtual);
    await marcarComprado(LISTA, 'leite-integral', true, 'Maria');
    servidor.sincronizar(aparelhoAtual);

    const item = comoItem(CAMINHO_LEITE);
    expect(item).not.toBeNull();

    await limparComprados(LISTA, [item as import('@/types').Item]);
    servidor.sincronizar(aparelhoAtual);

    expect(servidor.ler(CAMINHO_LEITE)?.['deleted']).toBe(true);
    const historico = servidor.ler(`lists/${LISTA}/history/leite-integral`);
    expect(historico?.['count']).toBe(1);
    expect(historico?.['name']).toBe('Leite integral');
  });

  it('duas limpezas somam a contagem do histórico (increment, não sobrescrita)', async () => {
    aparelhoAtual = new AparelhoFalso();
    const item = {
      id: 'leite-integral',
      catalogId: 'leite-integral',
      name: 'Leite integral',
      category: 'frios-laticinios' as const,
      qty: 1,
      unit: 'L' as const,
      note: '',
      checked: true,
      checkedBy: null,
      addedBy: null,
      createdAt: null,
      updatedAt: null,
      clientUpdatedAt: Date.now(),
      deleted: false,
    };

    await limparComprados(LISTA, [item]);
    await limparComprados(LISTA, [item]);
    servidor.sincronizar(aparelhoAtual);

    expect(servidor.ler(`lists/${LISTA}/history/leite-integral`)?.['count']).toBe(2);
  });
});

describe('saneamento dos campos', () => {
  it('corta nome em 80 e observação em 200 caracteres', async () => {
    aparelhoAtual = new AparelhoFalso();
    await adicionarItem(
      LISTA,
      { nome: 'a'.repeat(300), observacao: 'b'.repeat(500), qtd: 1 },
      null,
    );
    servidor.sincronizar(aparelhoAtual);

    const caminho = [...servidor.documentos.keys()].find((c) => c.includes('/items/')) as string;
    const documento = servidor.ler(caminho);
    expect((documento?.['name'] as string).length).toBeLessThanOrEqual(80);
    expect((documento?.['note'] as string).length).toBeLessThanOrEqual(200);
  });

  it('usa serverTimestamp em updatedAt e Date.now em clientUpdatedAt', async () => {
    aparelhoAtual = new AparelhoFalso();
    const antes = Date.now();
    await adicionarItem(LISTA, { produto: PRODUTO_LEITE, qtd: 1 }, null);

    const escrita = aparelhoAtual.fila[0] as Escrita;
    expect(escrita.dados['updatedAt']).toBe(MARCA_SERVER_TS);
    // `clientUpdatedAt` existe para ordenar enquanto `updatedAt` ainda é null.
    expect(escrita.dados['clientUpdatedAt']).toBeGreaterThanOrEqual(antes);
  });

  it('recusa nome vazio', async () => {
    aparelhoAtual = new AparelhoFalso();
    await expect(adicionarItem(LISTA, { nome: '   ', qtd: 1 }, null)).rejects.toThrow();
  });
});

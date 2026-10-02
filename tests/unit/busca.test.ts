import { beforeAll, describe, expect, it } from 'vitest';
import { MotorBusca } from '@/lib/busca';
import { carregarCatalogo } from '@/data/catalog';
import type { Produto } from '@/types';

let motor: MotorBusca;
let catalogo: Produto[];

beforeAll(async () => {
  catalogo = await carregarCatalogo();
  motor = new MotorBusca(catalogo);
}, 30_000);

/** Nomes dos resultados, para asserções legíveis. */
function nomes(consulta: string, limite = 8): string[] {
  return motor.buscar(consulta, { limite }).map((r) => r.produto.nome);
}

function ids(consulta: string, limite = 10): string[] {
  return motor.buscar(consulta, { limite }).map((r) => r.produto.id);
}

describe('busca — sem acento e sem diferenciar maiúsculas', () => {
  it('encontra com e sem acento', () => {
    expect(ids('pao de queijo')).toContain('pao-de-queijo');
    expect(ids('pão de queijo')).toContain('pao-de-queijo');
    expect(ids('PÃO DE QUEIJO')).toContain('pao-de-queijo');
  });

  it('encontra "maçã" digitado como "maca"', () => {
    expect(ids('maca')).toContain('maca-fuji');
    expect(ids('maçã')).toContain('maca-fuji');
  });

  it('ignora espaços sobrando', () => {
    expect(ids('  leite  integral  ')).toContain('leite-integral');
  });
});

describe('busca — sinônimos', () => {
  it('"refri" encontra refrigerante', () => {
    const resultado = ids('refri');
    expect(resultado.some((id) => id.startsWith('refrigerante-'))).toBe(true);
  });

  it('"massa" e "espaguete" encontram macarrão', () => {
    expect(ids('massa').some((id) => id.startsWith('macarrao-'))).toBe(true);
    expect(ids('espaguete')).toContain('macarrao-espaguete');
  });

  it('"miojo" encontra macarrão instantâneo', () => {
    expect(ids('miojo')).toContain('macarrao-instantaneo');
  });

  it('"bexiga" encontra balão', () => {
    expect(ids('bexiga')).toContain('balao');
  });

  it('"camisinha" encontra preservativo', () => {
    expect(ids('camisinha')).toContain('preservativo');
  });

  it('"aipim" e "macaxeira" encontram mandioca', () => {
    expect(ids('aipim')).toContain('mandioca');
    expect(ids('macaxeira')).toContain('mandioca');
  });

  it('"breja" encontra cerveja', () => {
    expect(ids('breja').some((id) => id.startsWith('cerveja-'))).toBe(true);
  });

  it('"papel de banheiro" encontra papel higiênico', () => {
    expect(ids('papel de banheiro')).toContain('papel-higienico');
  });
});

describe('busca — tolerância a erro de digitação', () => {
  it('"arros" encontra arroz', () => {
    expect(ids('arros').some((id) => id.startsWith('arroz'))).toBe(true);
  });

  it('"detergete" encontra detergente', () => {
    expect(ids('detergete').some((id) => id.startsWith('detergente'))).toBe(true);
  });

  it('"açucar" com erro ainda encontra açúcar', () => {
    expect(ids('acucra').some((id) => id.startsWith('acucar-'))).toBe(true);
  });

  it('"sabonte" encontra sabonete', () => {
    expect(ids('sabonte').some((id) => id.startsWith('sabonete'))).toBe(true);
  });
});

describe('busca — ordem dos resultados', () => {
  it('prefixo do nome vem antes de "contém"', () => {
    const resultado = nomes('leite', 20);
    const posicaoLeite = resultado.findIndex((n) => n.toLowerCase().startsWith('leite'));
    expect(posicaoLeite).toBe(0);
  });

  it('nome exato vem primeiro', () => {
    expect(nomes('tomate')[0]).toBe('Tomate');
    expect(nomes('cenoura')[0]).toBe('Cenoura');
  });

  it('itens frequentes da família passam na frente', () => {
    // "Tomate italiano" normalmente não é o primeiro para a consulta "tomate".
    const semFrequentes = motor.buscar('tomate', { limite: 5 });
    expect(semFrequentes[0]?.produto.id).toBe('tomate');

    const comFrequentes = motor.buscar('tomate', {
      limite: 5,
      frequentes: new Set(['tomate-italiano']),
    });
    expect(comFrequentes[0]?.produto.id).toBe('tomate-italiano');
    expect(comFrequentes[0]?.origem).toBe('frequente');
  });
});

describe('busca — casos de borda', () => {
  it('consulta vazia não devolve nada', () => {
    expect(motor.buscar('')).toEqual([]);
    expect(motor.buscar('   ')).toEqual([]);
  });

  it('consulta de uma letra devolve algo (prefixo)', () => {
    expect(motor.buscar('a', { limite: 5 }).length).toBeGreaterThan(0);
  });

  it('texto sem nenhuma relação devolve vazio', () => {
    expect(motor.buscar('xyzqwkjhgf', { limite: 5 })).toEqual([]);
  });

  it('respeita o limite pedido', () => {
    expect(motor.buscar('a', { limite: 3 }).length).toBeLessThanOrEqual(3);
  });
});

describe('busca — produtos criados pela família', () => {
  it('entram no mesmo índice do catálogo', () => {
    const proprio = new MotorBusca(catalogo);
    expect(proprio.buscar('tempero da vovo', { limite: 5 })).toEqual([]);

    proprio.adicionar([
      {
        id: 'familia:tempero-da-vovo',
        nome: 'Tempero da vovó',
        categoria: 'mercearia',
        sinonimos: ['tempero especial', 'tempero da vo'],
        unidadePadrao: 'un',
      },
    ]);

    expect(proprio.buscar('tempero da vovo', { limite: 5 })[0]?.produto.nome).toBe(
      'Tempero da vovó',
    );
    // E pelo sinônimo também.
    expect(proprio.buscar('tempero especial', { limite: 5 })[0]?.produto.id).toBe(
      'familia:tempero-da-vovo',
    );
  });

  it('remover tira do índice', () => {
    const proprio = new MotorBusca([]);
    proprio.adicionar([
      {
        id: 'familia:teste',
        nome: 'Item de teste',
        categoria: 'outros',
        sinonimos: ['teste'],
        unidadePadrao: 'un',
      },
    ]);
    expect(proprio.buscar('item de teste', { limite: 3 }).length).toBe(1);
    proprio.remover('familia:teste');
    expect(proprio.buscar('item de teste', { limite: 3 })).toEqual([]);
  });
});

describe('casarVarios — entrada por voz', () => {
  it('reconhece vários itens de uma fala', () => {
    const achados = motor.casarVarios(['leite', 'ovos', 'pão']);
    const encontrados = achados.map((p) => p.id);
    expect(encontrados.length).toBe(3);
    expect(encontrados.some((id) => id.startsWith('leite'))).toBe(true);
    expect(encontrados.some((id) => id.startsWith('ovo'))).toBe(true);
    expect(encontrados.some((id) => id.startsWith('pao'))).toBe(true);
  });

  it('não repete o mesmo produto', () => {
    const achados = motor.casarVarios(['leite', 'leite', 'leite']);
    expect(achados.length).toBe(1);
  });

  it('ignora trechos que não casam com nada', () => {
    const achados = motor.casarVarios(['arroz', 'zzzzqqqq']);
    expect(achados.length).toBe(1);
  });
});

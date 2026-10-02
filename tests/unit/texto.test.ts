import { describe, expect, it } from 'vitest';
import { capitalizar, distancia, normalizar, separarItensFalados, slug } from '@/lib/texto';

describe('normalizar', () => {
  it('remove acentos e deixa minúsculo', () => {
    expect(normalizar('Pão de Açúcar')).toBe('pao de acucar');
    expect(normalizar('MAÇÃ')).toBe('maca');
    expect(normalizar('Abóbora cabotiá')).toBe('abobora cabotia');
  });

  it('remove pontuação e colapsa espaços', () => {
    expect(normalizar('Leite  —  integral!!')).toBe('leite integral');
    expect(normalizar('  arroz  ')).toBe('arroz');
  });

  it('preserva números e hifens', () => {
    expect(normalizar('Fralda M-2 tamanho 3')).toBe('fralda m-2 tamanho 3');
  });
});

describe('slug', () => {
  it('gera o mesmo slug para variações de escrita', () => {
    // É isso que faz dois aparelhos offline escreverem no MESMO documento.
    expect(slug('Leite Integral')).toBe('leite-integral');
    expect(slug('leite integral')).toBe('leite-integral');
    expect(slug('  LEITE   INTEGRAL  ')).toBe('leite-integral');
    expect(slug('Leite integral!')).toBe('leite-integral');
  });

  it('trata acentos de forma estável', () => {
    expect(slug('Pão de queijo')).toBe('pao-de-queijo');
    expect(slug('pao de queijo')).toBe('pao-de-queijo');
  });

  it('não deixa hifens sobrando nas pontas', () => {
    expect(slug('--- arroz ---')).toBe('arroz');
    expect(slug('!!!')).toBe('');
  });

  it('limita o tamanho', () => {
    expect(slug('a'.repeat(200)).length).toBeLessThanOrEqual(80);
  });
});

describe('capitalizar', () => {
  it('sobe a primeira letra sem mexer no resto', () => {
    expect(capitalizar('leite integral')).toBe('Leite integral');
    expect(capitalizar('iPhone')).toBe('IPhone');
    expect(capitalizar('  café   com   leite ')).toBe('Café com leite');
    expect(capitalizar('')).toBe('');
  });
});

describe('distancia', () => {
  it('é zero para textos iguais', () => {
    expect(distancia('arroz', 'arroz')).toBe(0);
  });

  it('conta uma troca de letra', () => {
    expect(distancia('arros', 'arroz')).toBe(1);
    expect(distancia('tomate', 'tomato')).toBe(1);
  });

  it('para de calcular quando passa do limite', () => {
    expect(distancia('arroz', 'detergente', 2)).toBeGreaterThan(2);
  });
});

describe('separarItensFalados', () => {
  it('quebra uma fala em itens', () => {
    expect(separarItensFalados('leite, ovos e pão')).toEqual(['leite', 'ovos', 'pão']);
  });

  it('aceita ponto e vírgula e "mais"', () => {
    expect(separarItensFalados('arroz; feijão mais macarrão')).toEqual([
      'arroz',
      'feijão',
      'macarrão',
    ]);
  });

  it('descarta trechos muito curtos', () => {
    expect(separarItensFalados('leite, a, ovos')).toEqual(['leite', 'ovos']);
  });
});

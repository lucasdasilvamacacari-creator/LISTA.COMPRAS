import { describe, expect, it } from 'vitest';
import {
  historicoIdDeItem,
  idListaValido,
  itemIdDoCatalogo,
  itemIdPersonalizado,
  itemIdValido,
  novoIdLista,
  PREFIXO_PERSONALIZADO,
} from '@/lib/ids';

describe('novoIdLista', () => {
  it('tem pelo menos 20 caracteres', () => {
    expect(novoIdLista().length).toBeGreaterThanOrEqual(20);
  });

  it('usa só caracteres alfanuméricos seguros para URL', () => {
    for (let i = 0; i < 50; i++) {
      expect(novoIdLista()).toMatch(/^[A-Za-z0-9]+$/);
    }
  });

  it('não repete (na prática)', () => {
    const ids = new Set(Array.from({ length: 500 }, () => novoIdLista()));
    expect(ids.size).toBe(500);
  });

  it('passa pela própria validação', () => {
    expect(idListaValido(novoIdLista())).toBe(true);
  });
});

describe('idListaValido', () => {
  it('recusa ids curtos, longos e com caracteres estranhos', () => {
    expect(idListaValido('abc')).toBe(false);
    expect(idListaValido('a'.repeat(19))).toBe(false);
    expect(idListaValido('a'.repeat(41))).toBe(false);
    expect(idListaValido('abc-def-ghi-jkl-mno-pqr')).toBe(false);
    expect(idListaValido('')).toBe(false);
  });

  it('aceita o tamanho da faixa', () => {
    expect(idListaValido('a'.repeat(20))).toBe(true);
    expect(idListaValido('a'.repeat(40))).toBe(true);
  });
});

describe('itemId determinístico', () => {
  it('usa o próprio catalogId para produtos do catálogo', () => {
    expect(itemIdDoCatalogo('leite-integral')).toBe('leite-integral');
  });

  it('gera o MESMO id para o mesmo nome escrito de formas diferentes', () => {
    // O ponto central da anti-duplicação offline.
    const esperado = `${PREFIXO_PERSONALIZADO}suco-de-caju`;
    expect(itemIdPersonalizado('Suco de caju')).toBe(esperado);
    expect(itemIdPersonalizado('suco de caju')).toBe(esperado);
    expect(itemIdPersonalizado('  SUCO DE CAJU  ')).toBe(esperado);
    expect(itemIdPersonalizado('Suco de Cajú!')).toBe(esperado);
  });

  it('recusa nome vazio', () => {
    expect(() => itemIdPersonalizado('!!!')).toThrow();
  });

  it('valida o formato aceito pelas regras do Firestore', () => {
    expect(itemIdValido('leite-integral')).toBe(true);
    expect(itemIdValido('p_suco-de-caju')).toBe(true);
    expect(itemIdValido('Leite-Integral')).toBe(false);
    expect(itemIdValido('-leite')).toBe(false);
    expect(itemIdValido('leite_integral')).toBe(false);
  });

  it('o id do histórico espelha o do item, para somar a contagem', () => {
    expect(historicoIdDeItem('leite-integral')).toBe('leite-integral');
  });
});

import { describe, expect, it } from 'vitest';
import { extrairIdLista } from '@/lib/links';
import { listaComoTexto, totalEstimado } from '@/lib/exportar';
import type { CategoriaId, Item } from '@/types';

const ID = 'AbCdEfGhIjKlMnOpQrStUvWx'; // 24 caracteres

describe('extrairIdLista', () => {
  it('aceita link completo', () => {
    expect(extrairIdLista(`https://lista.exemplo.com/?l=${ID}`)).toBe(ID);
  });

  it('aceita link sem protocolo', () => {
    expect(extrairIdLista(`lista.exemplo.com/?l=${ID}`)).toBe(ID);
  });

  it('aceita link com outros parâmetros', () => {
    expect(extrairIdLista(`https://lista.exemplo.com/?acao=adicionar&l=${ID}`)).toBe(ID);
  });

  it('aceita o código solto', () => {
    expect(extrairIdLista(ID)).toBe(ID);
    expect(extrairIdLista(`  ${ID}  `)).toBe(ID);
  });

  it('aceita texto colado com o link no meio', () => {
    expect(extrairIdLista(`Olha a lista: https://x.com/?l=${ID} abraço`)).toBe(ID);
  });

  it('recusa texto sem id válido', () => {
    // Importante: devolver null é o que impede o app de criar uma lista
    // fantasma a partir de um link digitado errado.
    expect(extrairIdLista('')).toBeNull();
    expect(extrairIdLista('https://lista.exemplo.com/')).toBeNull();
    expect(extrairIdLista('abc123')).toBeNull();
    expect(extrairIdLista('https://x.com/?l=curto')).toBeNull();
  });
});

function item(parcial: Partial<Item> & { id: string; name: string; category: CategoriaId }): Item {
  return {
    catalogId: null,
    qty: 1,
    unit: 'un',
    note: '',
    checked: false,
    checkedBy: null,
    addedBy: null,
    createdAt: null,
    updatedAt: null,
    clientUpdatedAt: 0,
    deleted: false,
    ...parcial,
  };
}

describe('listaComoTexto', () => {
  const itens: Item[] = [
    item({ id: 'tomate', name: 'Tomate', category: 'hortifruti', qty: 2, unit: 'kg' }),
    item({ id: 'alface', name: 'Alface crespa', category: 'hortifruti' }),
    item({
      id: 'leite',
      name: 'Leite integral',
      category: 'frios-laticinios',
      qty: 3,
      unit: 'L',
      note: 'sem lactose',
    }),
    item({ id: 'pao', name: 'Pão francês', category: 'padaria', checked: true }),
  ];

  const ordem: CategoriaId[] = ['hortifruti', 'frios-laticinios', 'padaria'];

  it('agrupa por categoria na ordem dos corredores', () => {
    const texto = listaComoTexto('Mercado', itens, ordem);
    const posHorti = texto.indexOf('HORTIFRÚTI');
    const posFrios = texto.indexOf('FRIOS');
    const posPadaria = texto.indexOf('PADARIA');
    expect(posHorti).toBeGreaterThan(-1);
    expect(posHorti).toBeLessThan(posFrios);
    expect(posFrios).toBeLessThan(posPadaria);
  });

  it('usa ☐ para pendente e ☑ para comprado', () => {
    const texto = listaComoTexto('Mercado', itens, ordem);
    expect(texto).toContain('☐ Tomate — 2 kg');
    expect(texto).toContain('☑ Pão francês — 1 un');
  });

  it('inclui a observação entre parênteses', () => {
    expect(listaComoTexto('Mercado', itens, ordem)).toContain('(sem lactose)');
  });

  it('ordena alfabeticamente dentro da categoria', () => {
    const texto = listaComoTexto('Mercado', itens, ordem);
    expect(texto.indexOf('Alface crespa')).toBeLessThan(texto.indexOf('Tomate'));
  });

  it('pode deixar os comprados de fora', () => {
    const texto = listaComoTexto('Mercado', itens, ordem, false);
    expect(texto).not.toContain('Pão francês');
  });

  it('ignora itens apagados', () => {
    const comApagado = [...itens, item({ id: 'x', name: 'Apagado', category: 'outros', deleted: true })];
    expect(listaComoTexto('Mercado', comApagado, ordem)).not.toContain('Apagado');
  });

  it('inclui o cabeçalho e o contador', () => {
    const texto = listaComoTexto('Feira', itens, ordem);
    expect(texto).toContain('🛒 Feira');
    expect(texto).toContain('1 de 4 itens');
  });

  it('lida com lista vazia', () => {
    expect(listaComoTexto('Mercado', [], ordem)).toContain('A lista está vazia');
  });

  it('não perde categoria fora da ordem dos corredores', () => {
    const texto = listaComoTexto('Mercado', itens, ['padaria']);
    expect(texto).toContain('Tomate');
    expect(texto).toContain('Leite integral');
  });
});

describe('totalEstimado', () => {
  it('multiplica preço por quantidade', () => {
    const itens = [
      item({ id: 'a', name: 'A', category: 'outros', qty: 2, price: 5.5 }),
      item({ id: 'b', name: 'B', category: 'outros', qty: 3, price: 1 }),
    ];
    expect(totalEstimado(itens)).toBeCloseTo(14, 2);
  });

  it('ignora itens sem preço e apagados', () => {
    const itens = [
      item({ id: 'a', name: 'A', category: 'outros', qty: 1, price: 10 }),
      item({ id: 'b', name: 'B', category: 'outros', qty: 1 }),
      item({ id: 'c', name: 'C', category: 'outros', qty: 1, price: 99, deleted: true }),
    ];
    expect(totalEstimado(itens)).toBe(10);
  });

  it('devolve zero sem nenhum preço', () => {
    expect(totalEstimado([])).toBe(0);
  });
});

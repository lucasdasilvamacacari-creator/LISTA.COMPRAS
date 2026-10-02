import type { Produto } from './_tipos';

/** Churrasco: carvão, acendedores, sal grosso, espetos e acompanhamentos. */
export const produtos: Produto[] = [
  { id: 'carvao', nome: 'Carvão', categoria: 'churrasco', subcategoria: 'Fogo', sinonimos: ['carvao vegetal', 'saco de carvao'], unidadePadrao: 'pacote', emoji: '🔥' },
  { id: 'carvao-de-coco', nome: 'Carvão de coco', categoria: 'churrasco', subcategoria: 'Fogo', sinonimos: ['briquete de coco', 'carvao ecologico'], unidadePadrao: 'pacote', emoji: '🔥' },
  { id: 'briquete', nome: 'Briquete', categoria: 'churrasco', subcategoria: 'Fogo', sinonimos: ['briquetes', 'carvao prensado'], unidadePadrao: 'pacote', emoji: '🔥' },
  { id: 'acendedor-de-churrasqueira', nome: 'Acendedor de churrasqueira', categoria: 'churrasco', subcategoria: 'Fogo', sinonimos: ['acendedor', 'pastilha acendedora', 'alcool em gel para churrasco'], unidadePadrao: 'pacote', emoji: '🔥' },
  { id: 'lenha', nome: 'Lenha', categoria: 'churrasco', subcategoria: 'Fogo', sinonimos: ['madeira para churrasco', 'lenha de eucalipto'], unidadePadrao: 'pacote', emoji: '🪵' },
  { id: 'lasca-para-defumar', nome: 'Lasca para defumar', categoria: 'churrasco', subcategoria: 'Fogo', sinonimos: ['chips de madeira', 'lasca de defumacao'], unidadePadrao: 'pacote' },
  { id: 'sal-grosso', nome: 'Sal grosso', categoria: 'churrasco', subcategoria: 'Temperos', sinonimos: ['sal de churrasco', 'sal grosso para carne'], unidadePadrao: 'pacote', emoji: '🧂' },
  { id: 'sal-grosso-moido', nome: 'Sal grosso moído', categoria: 'churrasco', subcategoria: 'Temperos', sinonimos: ['sal parrilla', 'sal de parrilla'], unidadePadrao: 'pacote', emoji: '🧂' },
  { id: 'tempero-de-churrasco', nome: 'Tempero de churrasco', categoria: 'churrasco', subcategoria: 'Temperos', sinonimos: ['tempero para carne de churrasco', 'rub de churrasco'], unidadePadrao: 'un' },
  { id: 'molho-de-churrasco', nome: 'Molho de churrasco', categoria: 'churrasco', subcategoria: 'Temperos', sinonimos: ['molho para carne', 'molho de alho para churrasco'], unidadePadrao: 'un' },
  { id: 'vinagrete-pronto', nome: 'Vinagrete pronto', categoria: 'churrasco', subcategoria: 'Acompanhamentos', sinonimos: ['vinagrete', 'molho a campanha'], unidadePadrao: 'un' },
  { id: 'espeto-de-churrasco', nome: 'Espeto de churrasco', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['espeto', 'espeto de inox', 'espetos'], unidadePadrao: 'un' },
  { id: 'espeto-de-bambu', nome: 'Espeto de bambu', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['espetinho de madeira', 'palito de churrasquinho'], unidadePadrao: 'pacote' },
  { id: 'grelha-para-churrasco', nome: 'Grelha para churrasco', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['grelha', 'grelha de inox'], unidadePadrao: 'un' },
  { id: 'faca-de-churrasco', nome: 'Faca de churrasco', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['faca para carne', 'faca de corte'], unidadePadrao: 'un' },
  { id: 'tabua-de-corte', nome: 'Tábua de corte', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['tabua de carne', 'tabua de madeira'], unidadePadrao: 'un' },
  { id: 'abanador', nome: 'Abanador', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['abano', 'ventarola de churrasco'], unidadePadrao: 'un' },
  { id: 'luva-termica', nome: 'Luva térmica', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['luva de churrasqueira', 'luva para forno'], unidadePadrao: 'un', emoji: '🧤' },
  { id: 'pegador-de-churrasco', nome: 'Pegador de churrasco', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['pegador de carne', 'pinca de churrasco'], unidadePadrao: 'un' },
  { id: 'pao-de-alho-para-churrasco', nome: 'Pão de alho congelado', categoria: 'churrasco', subcategoria: 'Acompanhamentos', sinonimos: ['pao de alho de churrasco', 'pao de alho no espeto'], unidadePadrao: 'pacote', emoji: '🥖' },
  { id: 'farofa-para-churrasco', nome: 'Farofa para churrasco', categoria: 'churrasco', subcategoria: 'Acompanhamentos', sinonimos: ['farofa de churrasco', 'farofa pronta temperada'], unidadePadrao: 'pacote' },
  { id: 'queijo-coalho-no-espeto', nome: 'Queijo coalho no espeto', categoria: 'churrasco', subcategoria: 'Acompanhamentos', sinonimos: ['queijo de churrasco no espeto', 'espetinho de queijo'], unidadePadrao: 'pacote', emoji: '🧀' },
  { id: 'papel-para-churrasqueira', nome: 'Papel alumínio reforçado', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['aluminio de churrasco', 'papel aluminio grosso'], unidadePadrao: 'un' },
  { id: 'termometro-de-carne', nome: 'Termômetro de carne', categoria: 'churrasco', subcategoria: 'Utensílios', sinonimos: ['termometro culinario', 'termometro de churrasco'], unidadePadrao: 'un' },
];

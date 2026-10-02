import type { Produto } from './_tipos';

/** Pet: rações, petiscos, areia e cuidados para cães, gatos e outros bichos. */
export const produtos: Produto[] = [
  { id: 'racao-para-cao-adulto', nome: 'Ração para cão adulto', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['racao de cachorro', 'racao', 'comida de cachorro'], unidadePadrao: 'pacote', emoji: '🐕' },
  { id: 'racao-para-filhote-de-cao', nome: 'Ração para filhote de cão', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['racao de filhote', 'racao puppy'], unidadePadrao: 'pacote', emoji: '🐕' },
  { id: 'racao-para-cao-senior', nome: 'Ração para cão sênior', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['racao de cachorro idoso', 'racao senior'], unidadePadrao: 'pacote', emoji: '🐕' },
  { id: 'racao-umida-para-cao', nome: 'Ração úmida para cão', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['sache de cachorro', 'lata de racao', 'patê de cachorro'], unidadePadrao: 'un', emoji: '🐕' },
  { id: 'petisco-para-cao', nome: 'Petisco para cão', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['biscoito de cachorro', 'snack de cachorro', 'bifinho'], unidadePadrao: 'pacote', emoji: '🦴' },
  { id: 'osso-para-cao', nome: 'Osso para cão', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['osso de couro', 'ossinho de cachorro'], unidadePadrao: 'un', emoji: '🦴' },
  { id: 'tapete-higienico', nome: 'Tapete higiênico', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['tapete de pipi', 'tapete sanitario'], unidadePadrao: 'pacote' },
  { id: 'coleira', nome: 'Coleira', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['coleiras', 'coleira de cachorro'], unidadePadrao: 'un' },
  { id: 'coleira-antipulgas', nome: 'Coleira antipulgas', categoria: 'pet', subcategoria: 'Cães', sinonimos: ['coleira de pulga', 'antipulga'], unidadePadrao: 'un' },
  { id: 'shampoo-para-pet', nome: 'Shampoo para pet', categoria: 'pet', subcategoria: 'Cuidados', sinonimos: ['xampu de cachorro', 'shampoo de animal'], unidadePadrao: 'un' },
  { id: 'antipulgas-em-pipeta', nome: 'Antipulgas em pipeta', categoria: 'pet', subcategoria: 'Cuidados', sinonimos: ['antipulga de pingar', 'pipeta antiparasitaria'], unidadePadrao: 'caixa' },
  { id: 'vermifugo-para-pet', nome: 'Vermífugo para pet', categoria: 'pet', subcategoria: 'Cuidados', sinonimos: ['vermifugo de cachorro', 'remedio de verme'], unidadePadrao: 'caixa' },
  { id: 'saco-para-coleta-de-fezes', nome: 'Saquinho para coleta', categoria: 'pet', subcategoria: 'Cuidados', sinonimos: ['saquinho de cocô', 'cata caca'], unidadePadrao: 'pacote' },
  { id: 'racao-para-gato-adulto', nome: 'Ração para gato adulto', categoria: 'pet', subcategoria: 'Gatos', sinonimos: ['racao de gato', 'comida de gato'], unidadePadrao: 'pacote', emoji: '🐈' },
  { id: 'racao-para-filhote-de-gato', nome: 'Ração para filhote de gato', categoria: 'pet', subcategoria: 'Gatos', sinonimos: ['racao de gatinho', 'racao kitten'], unidadePadrao: 'pacote', emoji: '🐈' },
  { id: 'racao-umida-para-gato', nome: 'Ração úmida para gato', categoria: 'pet', subcategoria: 'Gatos', sinonimos: ['sache de gato', 'lata de gato'], unidadePadrao: 'un', emoji: '🐈' },
  { id: 'petisco-para-gato', nome: 'Petisco para gato', categoria: 'pet', subcategoria: 'Gatos', sinonimos: ['snack de gato', 'sache cremoso de gato'], unidadePadrao: 'pacote', emoji: '🐈' },
  { id: 'areia-para-gato', nome: 'Areia para gato', categoria: 'pet', subcategoria: 'Gatos', sinonimos: ['areia sanitaria', 'areia de gato', 'granulado'], unidadePadrao: 'pacote' },
  { id: 'areia-sanitaria-silica', nome: 'Areia sanitária de sílica', categoria: 'pet', subcategoria: 'Gatos', sinonimos: ['silica para gato', 'cristais sanitarios'], unidadePadrao: 'pacote' },
  { id: 'eliminador-de-odor-pet', nome: 'Eliminador de odor para pet', categoria: 'pet', subcategoria: 'Cuidados', sinonimos: ['tira odor de pet', 'neutralizador de xixi'], unidadePadrao: 'un' },
  { id: 'racao-para-passaro', nome: 'Ração para pássaro', categoria: 'pet', subcategoria: 'Outros', sinonimos: ['alpiste', 'mistura para passaro', 'semente de passaro'], unidadePadrao: 'pacote', emoji: '🐦' },
  { id: 'racao-para-peixe', nome: 'Ração para peixe', categoria: 'pet', subcategoria: 'Outros', sinonimos: ['comida de peixe', 'racao de aquario'], unidadePadrao: 'un', emoji: '🐠' },
  { id: 'racao-para-roedor', nome: 'Ração para roedor', categoria: 'pet', subcategoria: 'Outros', sinonimos: ['racao de hamster', 'comida de coelho'], unidadePadrao: 'pacote' },
  { id: 'brinquedo-para-pet', nome: 'Brinquedo para pet', categoria: 'pet', subcategoria: 'Cuidados', sinonimos: ['bolinha de cachorro', 'brinquedo de gato'], unidadePadrao: 'un' },
];

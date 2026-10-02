import type { Produto } from './_tipos';

/** Bebê e infantil: fórmulas, papinhas, fraldas, higiene e acessórios. */
export const produtos: Produto[] = [
  // ---------------------------------------------------------------- Fórmulas
  { id: 'formula-infantil-1', nome: 'Fórmula infantil 1 (0 a 6 meses)', categoria: 'bebe-infantil', subcategoria: 'Fórmulas', sinonimos: ['formula 1', 'leite de bebe', 'formula de partida'], unidadePadrao: 'un', emoji: '🍼' },
  { id: 'formula-infantil-2', nome: 'Fórmula infantil 2 (6 a 12 meses)', categoria: 'bebe-infantil', subcategoria: 'Fórmulas', sinonimos: ['formula 2', 'formula de seguimento'], unidadePadrao: 'un', emoji: '🍼' },
  { id: 'formula-infantil-3', nome: 'Fórmula infantil 3 (acima de 1 ano)', categoria: 'bebe-infantil', subcategoria: 'Fórmulas', sinonimos: ['formula 3', 'composto lacteo infantil'], unidadePadrao: 'un', emoji: '🍼' },
  { id: 'formula-sem-lactose-infantil', nome: 'Fórmula infantil sem lactose', categoria: 'bebe-infantil', subcategoria: 'Fórmulas', sinonimos: ['formula zero lactose', 'formula para intolerancia'], unidadePadrao: 'un', emoji: '🍼' },
  { id: 'formula-anti-refluxo', nome: 'Fórmula infantil anti-refluxo', categoria: 'bebe-infantil', subcategoria: 'Fórmulas', sinonimos: ['formula ar', 'formula espessada'], unidadePadrao: 'un', emoji: '🍼' },
  { id: 'formula-de-soja-infantil', nome: 'Fórmula infantil de soja', categoria: 'bebe-infantil', subcategoria: 'Fórmulas', sinonimos: ['formula vegetal de bebe'], unidadePadrao: 'un', emoji: '🍼' },
  { id: 'leite-infantil-liquido', nome: 'Leite infantil pronto', categoria: 'bebe-infantil', subcategoria: 'Fórmulas', sinonimos: ['leite de bebe liquido', 'formula liquida'], unidadePadrao: 'caixa', emoji: '🍼' },

  // ------------------------------------------------------- Papinhas e comidinhas
  { id: 'papinha-de-fruta', nome: 'Papinha de fruta', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['papinha', 'fruta em pote para bebe'], unidadePadrao: 'un' },
  { id: 'papinha-salgada', nome: 'Papinha salgada', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['papinha de legumes', 'comidinha de bebe'], unidadePadrao: 'un' },
  { id: 'papinha-em-sache', nome: 'Papinha em sachê', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['papinha de bisnaga', 'pouch de papinha'], unidadePadrao: 'un' },
  { id: 'cereal-infantil-arroz', nome: 'Cereal infantil de arroz', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['mucilon de arroz', 'farinha de arroz infantil'], unidadePadrao: 'caixa' },
  { id: 'cereal-infantil-multicereais', nome: 'Cereal infantil multicereais', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['mucilon multicereais', 'cereal de bebe misto'], unidadePadrao: 'caixa' },
  { id: 'biscoito-infantil', nome: 'Biscoito infantil', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['bolacha de bebe', 'biscoito de dentição'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'suco-infantil', nome: 'Suco infantil', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['suquinho de bebe', 'suco para crianca'], unidadePadrao: 'pacote', emoji: '🧃' },
  { id: 'snack-infantil', nome: 'Snack infantil', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['salgadinho de bebe', 'puff infantil'], unidadePadrao: 'pacote' },
  { id: 'macarrao-infantil', nome: 'Macarrão infantil', categoria: 'bebe-infantil', subcategoria: 'Papinhas', sinonimos: ['massa de letrinhas', 'macarrao de bebe'], unidadePadrao: 'pacote', emoji: '🍝' },

  // ------------------------------------------------------------------ Fraldas
  { id: 'fralda-rn', nome: 'Fralda RN', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda recem nascido', 'fralda tamanho rn'], unidadePadrao: 'pacote' },
  { id: 'fralda-p', nome: 'Fralda P', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda pequena', 'fralda tamanho p'], unidadePadrao: 'pacote' },
  { id: 'fralda-m', nome: 'Fralda M', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda media', 'fralda tamanho m'], unidadePadrao: 'pacote' },
  { id: 'fralda-g', nome: 'Fralda G', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda grande', 'fralda tamanho g'], unidadePadrao: 'pacote' },
  { id: 'fralda-xg', nome: 'Fralda XG', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda extra grande', 'fralda tamanho xg'], unidadePadrao: 'pacote' },
  { id: 'fralda-xxg', nome: 'Fralda XXG', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda xxg', 'fralda maior'], unidadePadrao: 'pacote' },
  { id: 'fralda-de-piscina', nome: 'Fralda de piscina', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda para agua', 'fralda de natacao'], unidadePadrao: 'pacote' },
  { id: 'fralda-de-pano', nome: 'Fralda de pano', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['fralda de tecido', 'fralda ecologica'], unidadePadrao: 'pacote' },
  { id: 'lenco-umedecido', nome: 'Lenço umedecido', categoria: 'bebe-infantil', subcategoria: 'Fraldas', sinonimos: ['lencinho umedecido', 'toalha umedecida'], unidadePadrao: 'pacote' },

  // ------------------------------------------------------------ Higiene do bebê
  { id: 'pomada-para-assadura', nome: 'Pomada para assadura', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['pomada de bebe', 'creme para assadura', 'hipoglos'], unidadePadrao: 'un' },
  { id: 'shampoo-infantil', nome: 'Shampoo infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['xampu de bebe', 'shampoo de bebe'], unidadePadrao: 'un' },
  { id: 'condicionador-infantil', nome: 'Condicionador infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['condicionador de bebe'], unidadePadrao: 'un' },
  { id: 'sabonete-infantil', nome: 'Sabonete infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['sabonete de bebe', 'sabonete liquido infantil'], unidadePadrao: 'un', emoji: '🧼' },
  { id: 'colonia-infantil', nome: 'Colônia infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['perfume de bebe', 'agua de colonia infantil'], unidadePadrao: 'un' },
  { id: 'oleo-para-bebe', nome: 'Óleo para bebê', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['oleo de amendoas para bebe', 'oleo corporal infantil'], unidadePadrao: 'un' },
  { id: 'talco-infantil', nome: 'Talco infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['talco de bebe', 'po antisseptico'], unidadePadrao: 'un' },
  { id: 'creme-hidratante-infantil', nome: 'Hidratante infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['creme de bebe', 'locao infantil'], unidadePadrao: 'un' },
  { id: 'escova-de-dente-infantil', nome: 'Escova de dente infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['escova de bebe', 'escova de crianca'], unidadePadrao: 'un', emoji: '🪥' },
  { id: 'creme-dental-infantil', nome: 'Creme dental infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['pasta de dente de crianca', 'gel dental infantil'], unidadePadrao: 'un' },
  { id: 'protetor-solar-infantil', nome: 'Protetor solar infantil', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['filtro solar de bebe', 'protetor solar de crianca'], unidadePadrao: 'un' },
  { id: 'sabao-para-roupa-de-bebe', nome: 'Sabão para roupa de bebê', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['sabao de coco infantil', 'sabao liquido de bebe'], unidadePadrao: 'un' },
  { id: 'amaciante-de-bebe', nome: 'Amaciante de roupa de bebê', categoria: 'bebe-infantil', subcategoria: 'Higiene', sinonimos: ['amaciante infantil'], unidadePadrao: 'un' },

  // ---------------------------------------------------------------- Acessórios
  { id: 'mamadeira', nome: 'Mamadeira', categoria: 'bebe-infantil', subcategoria: 'Acessórios', sinonimos: ['mamadeiras', 'garrafinha de bebe'], unidadePadrao: 'un', emoji: '🍼' },
  { id: 'bico-de-mamadeira', nome: 'Bico de mamadeira', categoria: 'bebe-infantil', subcategoria: 'Acessórios', sinonimos: ['bico de silicone', 'bico de reposicao'], unidadePadrao: 'un' },
  { id: 'chupeta', nome: 'Chupeta', categoria: 'bebe-infantil', subcategoria: 'Acessórios', sinonimos: ['chupetas', 'chupeta de silicone'], unidadePadrao: 'un' },
  { id: 'babador', nome: 'Babador', categoria: 'bebe-infantil', subcategoria: 'Acessórios', sinonimos: ['babadores', 'babeiro'], unidadePadrao: 'un' },
  { id: 'copo-de-transicao', nome: 'Copo de transição', categoria: 'bebe-infantil', subcategoria: 'Acessórios', sinonimos: ['copo com bico', 'copo de treinamento'], unidadePadrao: 'un' },
  { id: 'cotonete-infantil', nome: 'Cotonete infantil', categoria: 'bebe-infantil', subcategoria: 'Acessórios', sinonimos: ['haste flexivel de bebe', 'cotonete de seguranca'], unidadePadrao: 'caixa' },
];

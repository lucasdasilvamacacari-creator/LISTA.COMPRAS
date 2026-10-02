import type { Produto } from './_tipos';

/** Saudáveis e naturais: integrais, sem glúten, sem lactose, veganos e suplementos. */
export const produtos: Produto[] = [
  // ------------------------------------------------------------- Suplementos
  { id: 'whey-protein', nome: 'Whey protein', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['whey', 'proteina do soro', 'suplemento de proteina'], unidadePadrao: 'pacote' },
  { id: 'proteina-vegetal-em-po', nome: 'Proteína vegetal em pó', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['proteina vegana', 'veggie protein'], unidadePadrao: 'pacote' },
  { id: 'albumina', nome: 'Albumina', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['proteina de clara de ovo', 'albumina em po'], unidadePadrao: 'pacote' },
  { id: 'creatina', nome: 'Creatina', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['creatina monoidratada'], unidadePadrao: 'pacote' },
  { id: 'colageno', nome: 'Colágeno', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['colageno hidrolisado', 'colagenio'], unidadePadrao: 'pacote' },
  { id: 'multivitaminico', nome: 'Multivitamínico', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['polivitaminico', 'complexo vitaminico'], unidadePadrao: 'caixa' },
  { id: 'vitamina-c', nome: 'Vitamina C', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['acido ascorbico', 'vit c'], unidadePadrao: 'caixa' },
  { id: 'vitamina-d', nome: 'Vitamina D', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['vit d', 'colecalciferol'], unidadePadrao: 'caixa' },
  { id: 'complexo-b', nome: 'Complexo B', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['vitaminas do complexo b', 'vitamina b'], unidadePadrao: 'caixa' },
  { id: 'omega-3', nome: 'Ômega 3', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['omega 3', 'oleo de peixe'], unidadePadrao: 'caixa' },
  { id: 'magnesio', nome: 'Magnésio', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['cloreto de magnesio', 'magnesio quelato'], unidadePadrao: 'caixa' },
  { id: 'ferro-suplemento', nome: 'Ferro', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['suplemento de ferro', 'sulfato ferroso'], unidadePadrao: 'caixa' },
  { id: 'psyllium', nome: 'Psyllium', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['psilio', 'fibra de psyllium'], unidadePadrao: 'pacote' },
  { id: 'fibra-alimentar', nome: 'Fibra alimentar', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['fibra em po', 'suplemento de fibras'], unidadePadrao: 'pacote' },
  { id: 'probiotico', nome: 'Probiótico', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['lactobacilos', 'probioticos em sache'], unidadePadrao: 'caixa' },
  { id: 'spirulina', nome: 'Spirulina', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['espirulina', 'alga spirulina'], unidadePadrao: 'pacote' },
  { id: 'oleo-de-linhaca', nome: 'Óleo de linhaça', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['oleo de linhaca em capsula'], unidadePadrao: 'un' },
  { id: 'cha-verde-em-capsula', nome: 'Chá verde em cápsula', categoria: 'saudaveis', subcategoria: 'Suplementos', sinonimos: ['extrato de cha verde'], unidadePadrao: 'caixa' },

  // --------------------------------------------------------------- Integrais
  { id: 'pao-integral-100', nome: 'Pão 100% integral', categoria: 'saudaveis', subcategoria: 'Integrais', sinonimos: ['pao integral de verdade', 'pao de farinha integral'], unidadePadrao: 'pacote', emoji: '🍞' },
  { id: 'biscoito-integral-salgado', nome: 'Biscoito integral salgado', categoria: 'saudaveis', subcategoria: 'Integrais', sinonimos: ['cracker integral salgado'], unidadePadrao: 'pacote' },
  { id: 'arroz-integral-cozido-pronto', nome: 'Arroz integral pronto', categoria: 'saudaveis', subcategoria: 'Integrais', sinonimos: ['arroz pronto em sache', 'arroz integral de micro-ondas'], unidadePadrao: 'pacote' },
  { id: 'torrada-integral-fina', nome: 'Torrada fina integral', categoria: 'saudaveis', subcategoria: 'Integrais', sinonimos: ['torrada integral leve'], unidadePadrao: 'pacote' },
  { id: 'wrap-integral', nome: 'Wrap integral', categoria: 'saudaveis', subcategoria: 'Integrais', sinonimos: ['tortilha integral', 'pao folha integral'], unidadePadrao: 'pacote', emoji: '🌯' },
  { id: 'granola-integral', nome: 'Granola integral', categoria: 'saudaveis', subcategoria: 'Integrais', sinonimos: ['granola natural sem acucar'], unidadePadrao: 'pacote' },

  // --------------------------------------------------------------- Sem glúten
  { id: 'farinha-sem-gluten', nome: 'Mistura de farinha sem glúten', categoria: 'saudaveis', subcategoria: 'Sem glúten', sinonimos: ['farinha gluten free', 'mix sem gluten'], unidadePadrao: 'pacote' },
  { id: 'pao-de-forma-sem-gluten', nome: 'Pão de forma sem glúten', categoria: 'saudaveis', subcategoria: 'Sem glúten', sinonimos: ['pao gluten free fatiado'], unidadePadrao: 'pacote', emoji: '🍞' },
  { id: 'macarrao-de-arroz-sem-gluten', nome: 'Macarrão de arroz sem glúten', categoria: 'saudaveis', subcategoria: 'Sem glúten', sinonimos: ['massa de arroz', 'macarrao gluten free'], unidadePadrao: 'pacote', emoji: '🍝' },
  { id: 'bolo-sem-gluten', nome: 'Mistura para bolo sem glúten', categoria: 'saudaveis', subcategoria: 'Sem glúten', sinonimos: ['bolo gluten free', 'bolo para celiaco'], unidadePadrao: 'caixa' },
  { id: 'aveia-sem-gluten', nome: 'Aveia sem glúten', categoria: 'saudaveis', subcategoria: 'Sem glúten', sinonimos: ['aveia gluten free', 'aveia certificada'], unidadePadrao: 'pacote' },
  { id: 'snack-sem-gluten', nome: 'Snack sem glúten', categoria: 'saudaveis', subcategoria: 'Sem glúten', sinonimos: ['salgadinho gluten free'], unidadePadrao: 'pacote' },

  // -------------------------------------------------------------- Sem lactose
  { id: 'manteiga-sem-lactose', nome: 'Manteiga sem lactose', categoria: 'saudaveis', subcategoria: 'Sem lactose', sinonimos: ['manteiga zero lactose'], unidadePadrao: 'un', emoji: '🧈' },
  { id: 'creme-de-leite-sem-lactose', nome: 'Creme de leite sem lactose', categoria: 'saudaveis', subcategoria: 'Sem lactose', sinonimos: ['creme de leite zero lactose'], unidadePadrao: 'caixa' },
  { id: 'leite-condensado-sem-lactose', nome: 'Leite condensado sem lactose', categoria: 'saudaveis', subcategoria: 'Sem lactose', sinonimos: ['condensado zero lactose'], unidadePadrao: 'caixa' },
  { id: 'sorvete-sem-lactose', nome: 'Sorvete sem lactose', categoria: 'saudaveis', subcategoria: 'Sem lactose', sinonimos: ['sorvete zero lactose', 'sorvete vegano'], unidadePadrao: 'un', emoji: '🍨' },
  { id: 'lactase-em-gotas', nome: 'Lactase', categoria: 'saudaveis', subcategoria: 'Sem lactose', sinonimos: ['enzima lactase', 'lactase em gotas'], unidadePadrao: 'un' },
  { id: 'achocolatado-sem-lactose', nome: 'Achocolatado sem lactose', categoria: 'saudaveis', subcategoria: 'Sem lactose', sinonimos: ['achocolatado zero lactose'], unidadePadrao: 'pacote' },

  // -------------------------------------------------------------------- Vegano
  { id: 'hamburguer-vegetal', nome: 'Hambúrguer vegetal', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['burger vegano', 'hamburguer de planta', 'hamburguer vegetariano'], unidadePadrao: 'pacote', emoji: '🍔' },
  { id: 'almondega-vegana', nome: 'Almôndega vegana', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['almondega vegetal', 'almondega de soja'], unidadePadrao: 'pacote' },
  { id: 'tofu', nome: 'Tofu', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['queijo de soja', 'tofu firme'], unidadePadrao: 'un' },
  { id: 'tempeh', nome: 'Tempeh', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['tempe', 'soja fermentada'], unidadePadrao: 'un' },
  { id: 'queijo-vegano', nome: 'Queijo vegano', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['queijo vegetal', 'queijo de castanha'], unidadePadrao: 'pacote', emoji: '🧀' },
  { id: 'iogurte-vegetal', nome: 'Iogurte vegetal', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['iogurte vegano', 'iogurte de coco vegano'], unidadePadrao: 'un' },
  { id: 'maionese-vegana', nome: 'Maionese vegana', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['maionese sem ovo', 'maionese vegetal'], unidadePadrao: 'un' },
  { id: 'proteina-texturizada-de-soja', nome: 'Proteína texturizada de soja', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['carne de soja em flocos', 'pts fina'], unidadePadrao: 'pacote' },
  { id: 'levedura-nutricional', nome: 'Levedura nutricional', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['nutritional yeast', 'levedo em flocos'], unidadePadrao: 'pacote' },
  { id: 'seitan', nome: 'Seitan', categoria: 'saudaveis', subcategoria: 'Vegano', sinonimos: ['gluten de trigo', 'carne de gluten'], unidadePadrao: 'un' },

  // ---------------------------------------------------------------- Naturais
  { id: 'oleo-de-abacate', nome: 'Óleo de abacate', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['azeite de abacate'], unidadePadrao: 'un' },
  { id: 'vinagre-de-maca-organico', nome: 'Vinagre de maçã orgânico', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['vinagre organico', 'vinagre nao filtrado'], unidadePadrao: 'un' },
  { id: 'mel-organico', nome: 'Mel orgânico', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['mel puro organico', 'mel silvestre'], unidadePadrao: 'un', emoji: '🍯' },
  { id: 'acucar-organico', nome: 'Açúcar orgânico', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['acucar demerara organico'], unidadePadrao: 'pacote' },
  { id: 'cafe-organico', nome: 'Café orgânico', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['cafe sem agrotoxico'], unidadePadrao: 'pacote', emoji: '☕' },
  { id: 'sal-rosa-moido', nome: 'Sal rosa moído', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['sal do himalaia moido'], unidadePadrao: 'un', emoji: '🧂' },
  { id: 'agua-alcalina', nome: 'Água alcalina', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['agua ionizada', 'agua ph alto'], unidadePadrao: 'L', emoji: '💧' },
  { id: 'cacau-nibs', nome: 'Nibs de cacau', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['cacau em nibs', 'cacau quebrado'], unidadePadrao: 'pacote' },
  { id: 'oleo-de-coco-extravirgem', nome: 'Óleo de coco extravirgem', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['coco extra virgem', 'oleo de coco prensado a frio'], unidadePadrao: 'un' },
  { id: 'adocante-natural-de-monk', nome: 'Adoçante de monk fruit', categoria: 'saudaveis', subcategoria: 'Naturais', sinonimos: ['monk fruit', 'fruta dos monges'], unidadePadrao: 'un' },
];

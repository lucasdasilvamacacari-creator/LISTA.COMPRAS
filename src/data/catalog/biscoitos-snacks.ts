import type { Produto } from './_tipos';

/** Biscoitos e snacks: bolachas, salgadinhos, pipocas, oleaginosas e barras. */
export const produtos: Produto[] = [
  // --------------------------------------------------------------- Biscoitos
  { id: 'biscoito-cream-cracker', nome: 'Biscoito cream cracker', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['cream cracker', 'bolacha salgada', 'biscoito agua e sal'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-agua-e-sal', nome: 'Biscoito água e sal', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['bolacha de agua e sal', 'biscoito salgado'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-maizena', nome: 'Biscoito maisena', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['bolacha maisena', 'biscoito de maizena'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-leite', nome: 'Biscoito de leite', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['bolacha de leite', 'biscoito doce simples'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-recheado-chocolate', nome: 'Biscoito recheado de chocolate', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['bolacha recheada', 'biscoito recheado'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-recheado-morango', nome: 'Biscoito recheado de morango', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['bolacha recheada de morango'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-rosquinha', nome: 'Biscoito rosquinha', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['rosquinha de coco', 'rosquinha de chocolate'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-polvilho', nome: 'Biscoito de polvilho', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['biscoito de povilho', 'peta', 'biscoito de queijo'], unidadePadrao: 'pacote' },
  { id: 'biscoito-amanteigado', nome: 'Biscoito amanteigado', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['butter cookie', 'biscoito de manteiga'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'cookie', nome: 'Cookie', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['cookies', 'biscoito com gotas de chocolate'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-integral', nome: 'Biscoito integral', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['bolacha integral', 'biscoito de fibras'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-sem-gluten', nome: 'Biscoito sem glúten', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['bolacha sem gluten', 'biscoito gluten free'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-de-aveia', nome: 'Biscoito de aveia', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['cookie de aveia', 'bolacha de aveia'], unidadePadrao: 'pacote', emoji: '🍪' },
  { id: 'biscoito-champagne', nome: 'Biscoito champanhe', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['biscoito champagne', 'lady finger', 'biscoito para pave'], unidadePadrao: 'pacote' },
  { id: 'biscoito-waffle', nome: 'Biscoito waffle', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['wafer belga', 'biscoito de waffle'], unidadePadrao: 'pacote' },
  { id: 'bolacha-de-arroz', nome: 'Bolacha de arroz', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['galeta de arroz', 'biscoito de arroz integral'], unidadePadrao: 'pacote' },
  { id: 'biscoito-cracker-integral', nome: 'Cracker integral', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['cracker de fibras', 'bolacha cracker'], unidadePadrao: 'pacote' },
  { id: 'biscoito-salgado-temperado', nome: 'Biscoito salgado temperado', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['biscoito de cebola', 'biscoito de queijo salgado'], unidadePadrao: 'pacote' },
  { id: 'torradinha-para-petisco', nome: 'Torradinha para petisco', categoria: 'biscoitos-snacks', subcategoria: 'Biscoitos', sinonimos: ['torrada de petisco', 'biscoito para patê'], unidadePadrao: 'pacote' },

  // ------------------------------------------------------------ Salgadinhos
  { id: 'salgadinho-de-milho', nome: 'Salgadinho de milho', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['salgadinho', 'chips de milho', 'cheetos'], unidadePadrao: 'pacote' },
  { id: 'batata-chips', nome: 'Batata chips', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['batata frita de pacote', 'chips de batata', 'salgadinho de batata'], unidadePadrao: 'pacote', emoji: '🥔' },
  { id: 'batata-palha', nome: 'Batata palha', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['batata em palitos', 'batatinha palha'], unidadePadrao: 'pacote', emoji: '🥔' },
  { id: 'batata-ondulada', nome: 'Batata ondulada', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['chips ondulada', 'batata ruffles'], unidadePadrao: 'pacote', emoji: '🥔' },
  { id: 'salgadinho-de-trigo', nome: 'Salgadinho de trigo', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['snack de trigo', 'salgadinho de pacote'], unidadePadrao: 'pacote' },
  { id: 'tortilla-chips', nome: 'Tortilla chips', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['doritos', 'nachos', 'chips mexicano'], unidadePadrao: 'pacote' },
  { id: 'chips-de-mandioca', nome: 'Chips de mandioca', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['mandioca frita de pacote', 'chips de aipim'], unidadePadrao: 'pacote' },
  { id: 'chips-de-banana', nome: 'Chips de banana', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['banana chips', 'banana frita'], unidadePadrao: 'pacote' },
  { id: 'chips-de-batata-doce', nome: 'Chips de batata doce', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['batata doce chips'], unidadePadrao: 'pacote' },
  { id: 'chips-de-beterraba', nome: 'Chips de legumes', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['chips de beterraba', 'chips vegetal'], unidadePadrao: 'pacote' },
  { id: 'pretzel', nome: 'Pretzel', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['pretzels', 'salgadinho alemao'], unidadePadrao: 'pacote', emoji: '🥨' },
  { id: 'amendoim-japones', nome: 'Amendoim japonês', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['amendoim crocante', 'amendoim com casquinha'], unidadePadrao: 'pacote' },
  { id: 'torresmo-de-pacote', nome: 'Torresmo de pacote', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['torresmo', 'pururuca'], unidadePadrao: 'pacote' },
  { id: 'fandangos-de-presunto', nome: 'Snack de presunto', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['salgadinho de presunto', 'snack sabor presunto'], unidadePadrao: 'pacote' },
  { id: 'snack-de-queijo', nome: 'Snack de queijo', categoria: 'biscoitos-snacks', subcategoria: 'Salgadinhos', sinonimos: ['salgadinho de queijo', 'cheese puff'], unidadePadrao: 'pacote' },

  // ---------------------------------------------------------------- Pipocas
  { id: 'pipoca-de-micro-ondas', nome: 'Pipoca de micro-ondas', categoria: 'biscoitos-snacks', subcategoria: 'Pipocas', sinonimos: ['pipoca microondas', 'pipoca de pacote'], unidadePadrao: 'caixa', emoji: '🍿' },
  { id: 'pipoca-pronta-salgada', nome: 'Pipoca pronta salgada', categoria: 'biscoitos-snacks', subcategoria: 'Pipocas', sinonimos: ['pipoca de saco', 'pipoca ja estourada'], unidadePadrao: 'pacote', emoji: '🍿' },
  { id: 'pipoca-doce-pronta', nome: 'Pipoca pronta doce', categoria: 'biscoitos-snacks', subcategoria: 'Pipocas', sinonimos: ['pipoca doce de pacote'], unidadePadrao: 'pacote', emoji: '🍿' },
  { id: 'pipoca-de-queijo', nome: 'Pipoca sabor queijo', categoria: 'biscoitos-snacks', subcategoria: 'Pipocas', sinonimos: ['pipoca com queijo'], unidadePadrao: 'pacote', emoji: '🍿' },

  // ------------------------------------------------------------ Oleaginosas
  { id: 'amendoim-torrado', nome: 'Amendoim torrado', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['amendoim', 'amendoim salgado'], unidadePadrao: 'pacote', emoji: '🥜' },
  { id: 'amendoim-cru', nome: 'Amendoim cru', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['amendoim com casca', 'amendoim para pacoca'], unidadePadrao: 'pacote', emoji: '🥜' },
  { id: 'castanha-de-caju', nome: 'Castanha de caju', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['caju torrado', 'castanha caju'], unidadePadrao: 'pacote' },
  { id: 'castanha-do-para', nome: 'Castanha do pará', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['castanha do brasil', 'castanha para'], unidadePadrao: 'pacote' },
  { id: 'noz', nome: 'Noz', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['nozes', 'noz pecan'], unidadePadrao: 'pacote' },
  { id: 'amendoa', nome: 'Amêndoa', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['amendoas', 'amendoa torrada'], unidadePadrao: 'pacote' },
  { id: 'avela', nome: 'Avelã', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['avelas', 'avela torrada'], unidadePadrao: 'pacote' },
  { id: 'pistache', nome: 'Pistache', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['pistaches', 'pistacho'], unidadePadrao: 'pacote' },
  { id: 'macadamia', nome: 'Macadâmia', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['macadamia torrada', 'noz macadamia'], unidadePadrao: 'pacote' },
  { id: 'mix-de-castanhas', nome: 'Mix de castanhas', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['mix de nuts', 'castanhas sortidas'], unidadePadrao: 'pacote' },
  { id: 'nuts-com-frutas-secas', nome: 'Mix de nuts com frutas secas', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['trail mix', 'mix energetico'], unidadePadrao: 'pacote' },
  { id: 'amendoim-doce', nome: 'Amendoim doce', categoria: 'biscoitos-snacks', subcategoria: 'Oleaginosas', sinonimos: ['amendoim caramelizado', 'amendoim confeitado'], unidadePadrao: 'pacote', emoji: '🥜' },

  // ----------------------------------------------------- Barras e outros snacks
  { id: 'barra-de-cereal', nome: 'Barra de cereal', categoria: 'biscoitos-snacks', subcategoria: 'Barras', sinonimos: ['barrinha de cereal', 'barra'], unidadePadrao: 'caixa' },
  { id: 'barra-de-cereal-com-chocolate', nome: 'Barra de cereal com chocolate', categoria: 'biscoitos-snacks', subcategoria: 'Barras', sinonimos: ['barrinha com chocolate'], unidadePadrao: 'caixa' },
  { id: 'barra-de-proteina', nome: 'Barra de proteína', categoria: 'biscoitos-snacks', subcategoria: 'Barras', sinonimos: ['protein bar', 'barrinha proteica'], unidadePadrao: 'caixa' },
  { id: 'barra-de-castanhas', nome: 'Barra de castanhas', categoria: 'biscoitos-snacks', subcategoria: 'Barras', sinonimos: ['barra de nuts', 'barrinha de castanha'], unidadePadrao: 'caixa' },
  { id: 'barra-de-frutas', nome: 'Barra de frutas', categoria: 'biscoitos-snacks', subcategoria: 'Barras', sinonimos: ['barrinha de fruta', 'barra de tamara'], unidadePadrao: 'caixa' },
  { id: 'granola-em-barra', nome: 'Granola em barra', categoria: 'biscoitos-snacks', subcategoria: 'Barras', sinonimos: ['barra de granola'], unidadePadrao: 'caixa' },
  { id: 'rapadura', nome: 'Rapadura', categoria: 'biscoitos-snacks', subcategoria: 'Barras', sinonimos: ['rapadurinha', 'acucar de rapadura'], unidadePadrao: 'un' },
  { id: 'azeitona-para-petisco', nome: 'Petisco de azeitona', categoria: 'biscoitos-snacks', subcategoria: 'Petiscos', sinonimos: ['azeitona em sache', 'azeitona snack'], unidadePadrao: 'pacote', emoji: '🫒' },
  { id: 'queijo-em-palito', nome: 'Queijo em palito', categoria: 'biscoitos-snacks', subcategoria: 'Petiscos', sinonimos: ['palito de queijo', 'snack de queijo em palito'], unidadePadrao: 'pacote', emoji: '🧀' },
];

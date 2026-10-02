import type { Produto } from './_tipos';

/** Descartáveis e utilidades: papéis, embalagens, festa, pilhas e lâmpadas. */
export const produtos: Produto[] = [
  // ------------------------------------------------------------------ Papéis
  { id: 'papel-toalha', nome: 'Papel toalha', categoria: 'descartaveis', subcategoria: 'Papéis', sinonimos: ['papel de cozinha', 'rolo de papel toalha'], unidadePadrao: 'pacote' },
  { id: 'guardanapo', nome: 'Guardanapo', categoria: 'descartaveis', subcategoria: 'Papéis', sinonimos: ['guardanapos', 'guardanapo de papel'], unidadePadrao: 'pacote' },
  { id: 'papel-manteiga', nome: 'Papel manteiga', categoria: 'descartaveis', subcategoria: 'Papéis', sinonimos: ['papel para forno', 'papel vegetal'], unidadePadrao: 'un' },
  { id: 'forma-de-papel-para-cupcake', nome: 'Forminha de papel', categoria: 'descartaveis', subcategoria: 'Papéis', sinonimos: ['forminha de cupcake', 'forminha de doce'], unidadePadrao: 'pacote' },

  // ------------------------------------------------------------ Embalagens
  { id: 'papel-aluminio', nome: 'Papel alumínio', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['aluminio', 'rolo de aluminio'], unidadePadrao: 'un' },
  { id: 'filme-pvc', nome: 'Filme PVC', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['plastico filme', 'filme plastico', 'rolopack'], unidadePadrao: 'un' },
  { id: 'saco-plastico-para-alimentos', nome: 'Saco plástico para alimentos', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['saquinho plastico', 'saco de freezer'], unidadePadrao: 'pacote' },
  { id: 'saco-zip', nome: 'Saco zip', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['saco hermetico', 'ziplock'], unidadePadrao: 'pacote' },
  { id: 'pote-plastico-descartavel', nome: 'Pote plástico descartável', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['pote de marmita', 'pote para viagem'], unidadePadrao: 'pacote' },
  { id: 'marmita-de-aluminio', nome: 'Marmita de alumínio', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['bandeja de aluminio', 'forma de aluminio'], unidadePadrao: 'pacote' },
  { id: 'forma-de-aluminio-para-bolo', nome: 'Forma de alumínio para bolo', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['forma descartavel de bolo'], unidadePadrao: 'pacote' },
  { id: 'papel-para-embrulho', nome: 'Papel para embrulho', categoria: 'descartaveis', subcategoria: 'Embalagens', sinonimos: ['papel de presente', 'papel de embalagem'], unidadePadrao: 'un' },

  // ---------------------------------------------------------------- Festa
  { id: 'copo-descartavel', nome: 'Copo descartável', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['copo plastico', 'copinho'], unidadePadrao: 'pacote' },
  { id: 'copo-descartavel-200ml', nome: 'Copo descartável 200 ml', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['copo de agua descartavel'], unidadePadrao: 'pacote' },
  { id: 'copo-descartavel-50ml', nome: 'Copinho de café descartável', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['copo de cafe', 'copinho 50ml'], unidadePadrao: 'pacote' },
  { id: 'prato-descartavel', nome: 'Prato descartável', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['prato plastico', 'prato de festa'], unidadePadrao: 'pacote' },
  { id: 'talher-descartavel', nome: 'Talher descartável', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['garfo de plastico', 'kit de talher descartavel'], unidadePadrao: 'pacote' },
  { id: 'canudo', nome: 'Canudo', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['canudos', 'canudinho'], unidadePadrao: 'pacote' },
  { id: 'palito-de-dente', nome: 'Palito de dente', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['palitos', 'palito dental'], unidadePadrao: 'caixa' },
  { id: 'palito-para-petisco', nome: 'Palito para petisco', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['palito de festa', 'espetinho de petisco'], unidadePadrao: 'pacote' },
  { id: 'toalha-de-mesa-descartavel', nome: 'Toalha de mesa descartável', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['toalha de papel para mesa', 'toalha de festa'], unidadePadrao: 'un' },
  { id: 'vela-de-aniversario', nome: 'Vela de aniversário', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['velinha', 'vela de bolo'], unidadePadrao: 'pacote', emoji: '🕯️' },
  { id: 'balao', nome: 'Balão', categoria: 'descartaveis', subcategoria: 'Festa', sinonimos: ['bexiga', 'baloes', 'bola de festa'], unidadePadrao: 'pacote', emoji: '🎈' },

  // ------------------------------------------------------------- Utilidades
  { id: 'vela', nome: 'Vela', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['velas', 'vela branca'], unidadePadrao: 'pacote', emoji: '🕯️' },
  { id: 'fosforo', nome: 'Fósforo', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['caixa de fosforo', 'fosforos'], unidadePadrao: 'pacote' },
  { id: 'isqueiro', nome: 'Isqueiro', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['isqueiros', 'acendedor de fogao'], unidadePadrao: 'un' },
  { id: 'pilha-aa', nome: 'Pilha AA', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['pilha pequena', 'pilha palito grossa'], unidadePadrao: 'pacote', emoji: '🔋' },
  { id: 'pilha-aaa', nome: 'Pilha AAA', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['pilha palito', 'pilha fininha'], unidadePadrao: 'pacote', emoji: '🔋' },
  { id: 'pilha-c', nome: 'Pilha C', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['pilha media'], unidadePadrao: 'pacote', emoji: '🔋' },
  { id: 'pilha-d', nome: 'Pilha D', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['pilha grande'], unidadePadrao: 'pacote', emoji: '🔋' },
  { id: 'bateria-9v', nome: 'Bateria 9V', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['bateria quadrada', 'bateria de 9 volts'], unidadePadrao: 'un', emoji: '🔋' },
  { id: 'bateria-de-relogio', nome: 'Bateria de relógio', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['bateria botao', 'pilha de moeda'], unidadePadrao: 'un', emoji: '🔋' },
  { id: 'lampada-led', nome: 'Lâmpada LED', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['lampada', 'lampada economica'], unidadePadrao: 'un', emoji: '💡' },
  { id: 'lampada-fluorescente', nome: 'Lâmpada fluorescente', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['lampada tubular', 'lampada branca'], unidadePadrao: 'un', emoji: '💡' },
  { id: 'extensao-eletrica', nome: 'Extensão elétrica', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['extensao', 'benjamin', 'filtro de linha'], unidadePadrao: 'un' },
  { id: 'fita-adesiva', nome: 'Fita adesiva', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['durex', 'fita transparente'], unidadePadrao: 'un' },
  { id: 'fita-crepe', nome: 'Fita crepe', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['fita de papel', 'crepe'], unidadePadrao: 'un' },
  { id: 'cola-branca', nome: 'Cola branca', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['cola escolar', 'cola de papel'], unidadePadrao: 'un' },
  { id: 'cola-instantanea', nome: 'Cola instantânea', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['super cola', 'cola de segundos'], unidadePadrao: 'un' },
  { id: 'barbante', nome: 'Barbante', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['linha de barbante', 'cordao'], unidadePadrao: 'un' },
  { id: 'luva-descartavel', nome: 'Luva descartável', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['luva de latex', 'luva plastica'], unidadePadrao: 'caixa', emoji: '🧤' },
  { id: 'touca-descartavel', nome: 'Touca descartável', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['gorro descartavel', 'touca de cozinha'], unidadePadrao: 'pacote' },
  { id: 'mascara-descartavel', nome: 'Máscara descartável', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['mascara cirurgica', 'mascara facial'], unidadePadrao: 'caixa' },
  { id: 'filtro-de-cafe-numero-103', nome: 'Coador de café de pano', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['coador de pano', 'coador de flanela'], unidadePadrao: 'un' },
  { id: 'esponja-para-fogao', nome: 'Protetor de fogão', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['papel para boca de fogao', 'protetor de boca de fogao'], unidadePadrao: 'pacote' },
  { id: 'papel-para-air-fryer', nome: 'Papel para air fryer', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['forma de papel para fritadeira', 'papel de air fryer'], unidadePadrao: 'pacote' },
  { id: 'absorvente-de-geladeira', nome: 'Absorvedor de odor de geladeira', categoria: 'descartaveis', subcategoria: 'Utilidades', sinonimos: ['tira odor de geladeira', 'absorvedor de cheiro'], unidadePadrao: 'un' },
];

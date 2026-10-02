import type { Produto } from './_tipos';

/** Congelados: pratos prontos, pizzas, empanados, legumes, polpas e sorvetes. */
export const produtos: Produto[] = [
  // ------------------------------------------------------------ Pratos prontos
  { id: 'lasanha-congelada', nome: 'Lasanha congelada', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['lasanha pronta', 'lasanha de forno'], unidadePadrao: 'un' },
  { id: 'lasanha-a-bolonhesa', nome: 'Lasanha à bolonhesa', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['lasanha de carne'], unidadePadrao: 'un' },
  { id: 'lasanha-quatro-queijos', nome: 'Lasanha quatro queijos', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['lasanha de queijo'], unidadePadrao: 'un' },
  { id: 'escondidinho-congelado', nome: 'Escondidinho congelado', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['escondidinho de carne seca', 'escondidinho pronto'], unidadePadrao: 'un' },
  { id: 'strogonoff-congelado', nome: 'Strogonoff congelado', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['estrogonofe pronto', 'strogonoff pronto'], unidadePadrao: 'un' },
  { id: 'arroz-carreteiro-congelado', nome: 'Arroz carreteiro congelado', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['carreteiro pronto'], unidadePadrao: 'un' },
  { id: 'feijoada-congelada', nome: 'Feijoada congelada', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['feijoada pronta congelada'], unidadePadrao: 'un' },
  { id: 'macarronada-congelada', nome: 'Macarronada congelada', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['massa pronta congelada', 'penne pronto'], unidadePadrao: 'un', emoji: '🍝' },
  { id: 'prato-pronto-individual', nome: 'Prato pronto individual', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['marmita congelada', 'refeicao pronta'], unidadePadrao: 'un' },
  { id: 'marmita-fitness', nome: 'Marmita fitness congelada', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['marmita saudavel', 'refeicao fit'], unidadePadrao: 'un' },
  { id: 'panqueca-congelada', nome: 'Panqueca congelada', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['panqueca pronta', 'panqueca de carne'], unidadePadrao: 'pacote' },
  { id: 'canelone-congelado', nome: 'Canelone congelado', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['canelone pronto', 'cannelloni'], unidadePadrao: 'un' },
  { id: 'risoto-congelado', nome: 'Risoto congelado', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['risoto pronto'], unidadePadrao: 'un' },
  { id: 'moqueca-congelada', nome: 'Moqueca congelada', categoria: 'congelados', subcategoria: 'Pratos prontos', sinonimos: ['moqueca pronta'], unidadePadrao: 'un' },

  // ---------------------------------------------------------------- Pizzas
  { id: 'pizza-congelada', nome: 'Pizza congelada', categoria: 'congelados', subcategoria: 'Pizzas', sinonimos: ['pizza pronta', 'pizza de forno'], unidadePadrao: 'un', emoji: '🍕' },
  { id: 'pizza-de-mussarela', nome: 'Pizza de mussarela congelada', categoria: 'congelados', subcategoria: 'Pizzas', sinonimos: ['pizza de queijo'], unidadePadrao: 'un', emoji: '🍕' },
  { id: 'pizza-de-calabresa', nome: 'Pizza de calabresa congelada', categoria: 'congelados', subcategoria: 'Pizzas', sinonimos: ['pizza calabresa'], unidadePadrao: 'un', emoji: '🍕' },
  { id: 'pizza-portuguesa', nome: 'Pizza portuguesa congelada', categoria: 'congelados', subcategoria: 'Pizzas', sinonimos: ['pizza portuguesa'], unidadePadrao: 'un', emoji: '🍕' },
  { id: 'pizza-doce', nome: 'Pizza doce congelada', categoria: 'congelados', subcategoria: 'Pizzas', sinonimos: ['pizza de chocolate', 'pizza de brigadeiro'], unidadePadrao: 'un', emoji: '🍕' },
  { id: 'mini-pizza', nome: 'Mini pizza congelada', categoria: 'congelados', subcategoria: 'Pizzas', sinonimos: ['pizza pequena', 'pizzete'], unidadePadrao: 'pacote', emoji: '🍕' },
  { id: 'esfiha-congelada', nome: 'Esfiha congelada', categoria: 'congelados', subcategoria: 'Pizzas', sinonimos: ['esfirra congelada'], unidadePadrao: 'pacote' },

  // -------------------------------------------------------------- Empanados
  { id: 'nugget-de-frango', nome: 'Nugget de frango', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['nuggets', 'empanado de frango', 'frango empanado'], unidadePadrao: 'pacote', emoji: '🍗' },
  { id: 'empanado-de-frango', nome: 'Empanado de frango', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['frango a passarinho empanado', 'steak de frango'], unidadePadrao: 'pacote', emoji: '🍗' },
  { id: 'steak-de-frango', nome: 'Steak de frango', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['hamburguer empanado de frango', 'file empanado congelado'], unidadePadrao: 'pacote' },
  { id: 'hamburguer-congelado', nome: 'Hambúrguer congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['hamburguer de pacote', 'burger congelado'], unidadePadrao: 'pacote', emoji: '🍔' },
  { id: 'kibe-congelado', nome: 'Kibe congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['quibe congelado', 'kibe pronto'], unidadePadrao: 'pacote' },
  { id: 'coxinha-congelada', nome: 'Coxinha congelada', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['salgado congelado', 'coxinha para fritar'], unidadePadrao: 'pacote' },
  { id: 'salgadinho-de-festa-congelado', nome: 'Salgadinho de festa congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['mix de salgadinhos', 'salgado de festa'], unidadePadrao: 'pacote' },
  { id: 'bolinho-de-bacalhau-congelado', nome: 'Bolinho de bacalhau congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['bolinho de bacalhau', 'pastel de bacalhau'], unidadePadrao: 'pacote' },
  { id: 'bolinho-de-queijo-congelado', nome: 'Bolinho de queijo congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['bolinha de queijo'], unidadePadrao: 'pacote' },
  { id: 'anel-de-cebola-congelado', nome: 'Anel de cebola congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['onion rings', 'cebola empanada'], unidadePadrao: 'pacote' },
  { id: 'peixe-empanado-congelado', nome: 'Peixe empanado congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['fish finger', 'file de peixe congelado empanado'], unidadePadrao: 'pacote', emoji: '🐟' },
  { id: 'camarao-empanado-congelado', nome: 'Camarão empanado congelado', categoria: 'congelados', subcategoria: 'Empanados', sinonimos: ['camarao a milanesa'], unidadePadrao: 'pacote', emoji: '🦐' },

  // -------------------------------------------------------------- Batatas
  { id: 'batata-frita-congelada', nome: 'Batata frita congelada', categoria: 'congelados', subcategoria: 'Batatas', sinonimos: ['batata palito congelada', 'batata para fritar'], unidadePadrao: 'pacote', emoji: '🍟' },
  { id: 'batata-rustica-congelada', nome: 'Batata rústica congelada', categoria: 'congelados', subcategoria: 'Batatas', sinonimos: ['batata com casca congelada', 'batata gourmet'], unidadePadrao: 'pacote', emoji: '🍟' },
  { id: 'batata-noisette', nome: 'Batata noisette', categoria: 'congelados', subcategoria: 'Batatas', sinonimos: ['bolinha de batata', 'batata bolinha'], unidadePadrao: 'pacote' },
  { id: 'batata-smile', nome: 'Batata sorriso', categoria: 'congelados', subcategoria: 'Batatas', sinonimos: ['batata smile', 'batata carinha'], unidadePadrao: 'pacote' },
  { id: 'batata-doce-congelada', nome: 'Batata doce congelada', categoria: 'congelados', subcategoria: 'Batatas', sinonimos: ['batata doce em palito congelada'], unidadePadrao: 'pacote' },
  { id: 'mandioca-congelada', nome: 'Mandioca congelada', categoria: 'congelados', subcategoria: 'Batatas', sinonimos: ['aipim congelado', 'macaxeira congelada'], unidadePadrao: 'pacote' },

  // ------------------------------------------------------- Legumes e verduras
  { id: 'ervilha-congelada', nome: 'Ervilha congelada', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['ervilha em pacote congelada'], unidadePadrao: 'pacote' },
  { id: 'milho-congelado', nome: 'Milho congelado', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['milho verde congelado'], unidadePadrao: 'pacote', emoji: '🌽' },
  { id: 'brocolis-congelado', nome: 'Brócolis congelado', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['brocolis em pacote'], unidadePadrao: 'pacote', emoji: '🥦' },
  { id: 'couve-flor-congelada', nome: 'Couve-flor congelada', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['couve flor em pacote'], unidadePadrao: 'pacote' },
  { id: 'vagem-congelada', nome: 'Vagem congelada', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['vagem em pacote'], unidadePadrao: 'pacote' },
  { id: 'seleta-congelada', nome: 'Seleta de legumes congelada', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['mix de legumes congelado', 'jardineira congelada'], unidadePadrao: 'pacote' },
  { id: 'espinafre-congelado', nome: 'Espinafre congelado', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['espinafre em pacote'], unidadePadrao: 'pacote' },
  { id: 'quiabo-congelado', nome: 'Quiabo congelado', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['quiabo em pacote'], unidadePadrao: 'pacote' },
  { id: 'abobora-congelada', nome: 'Abóbora congelada', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['abobora em cubos congelada'], unidadePadrao: 'pacote' },
  { id: 'couve-congelada', nome: 'Couve congelada', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['couve picada congelada'], unidadePadrao: 'pacote' },
  { id: 'alho-congelado', nome: 'Alho congelado', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['alho picado congelado'], unidadePadrao: 'pacote', emoji: '🧄' },
  { id: 'edamame-congelado', nome: 'Edamame congelado', categoria: 'congelados', subcategoria: 'Legumes', sinonimos: ['edamame', 'soja verde congelada'], unidadePadrao: 'pacote' },

  // ----------------------------------------------------------- Polpas e frutas
  { id: 'polpa-de-acai', nome: 'Polpa de açaí', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['acai congelado', 'acai em polpa'], unidadePadrao: 'pacote' },
  { id: 'acai-em-creme', nome: 'Açaí cremoso', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['acai pronto', 'creme de acai'], unidadePadrao: 'un' },
  { id: 'polpa-de-morango', nome: 'Polpa de morango', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['morango congelado em polpa'], unidadePadrao: 'pacote', emoji: '🍓' },
  { id: 'polpa-de-maracuja', nome: 'Polpa de maracujá', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['maracuja congelado'], unidadePadrao: 'pacote' },
  { id: 'polpa-de-manga', nome: 'Polpa de manga', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['manga congelada em polpa'], unidadePadrao: 'pacote', emoji: '🥭' },
  { id: 'polpa-de-caju', nome: 'Polpa de caju', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['caju congelado'], unidadePadrao: 'pacote' },
  { id: 'polpa-de-acerola', nome: 'Polpa de acerola', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['acerola congelada'], unidadePadrao: 'pacote' },
  { id: 'polpa-de-goiaba', nome: 'Polpa de goiaba', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['goiaba congelada'], unidadePadrao: 'pacote' },
  { id: 'polpa-de-cupuacu', nome: 'Polpa de cupuaçu', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['cupuacu congelado'], unidadePadrao: 'pacote' },
  { id: 'frutas-vermelhas-congeladas', nome: 'Frutas vermelhas congeladas', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['mix de berries', 'frutas congeladas'], unidadePadrao: 'pacote', emoji: '🫐' },
  { id: 'banana-congelada', nome: 'Banana congelada', categoria: 'congelados', subcategoria: 'Polpas', sinonimos: ['banana para vitamina'], unidadePadrao: 'pacote', emoji: '🍌' },

  // ------------------------------------------------------------- Sorvetes
  { id: 'sorvete-de-pote', nome: 'Sorvete de pote', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['sorvete', 'pote de sorvete'], unidadePadrao: 'un', emoji: '🍨' },
  { id: 'sorvete-de-chocolate', nome: 'Sorvete de chocolate', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['sorvete sabor chocolate'], unidadePadrao: 'un', emoji: '🍨' },
  { id: 'sorvete-de-creme', nome: 'Sorvete de creme', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['sorvete de baunilha', 'sorvete branco'], unidadePadrao: 'un', emoji: '🍨' },
  { id: 'sorvete-de-morango', nome: 'Sorvete de morango', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['sorvete sabor morango'], unidadePadrao: 'un', emoji: '🍨' },
  { id: 'picole', nome: 'Picolé', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['picoles', 'sorvete de palito'], unidadePadrao: 'pacote', emoji: '🍡' },
  { id: 'picole-de-fruta', nome: 'Picolé de fruta', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['picole natural', 'sacole'], unidadePadrao: 'pacote' },
  { id: 'sanduiche-de-sorvete', nome: 'Sanduíche de sorvete', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['sorvete sanduiche', 'biscoito com sorvete'], unidadePadrao: 'pacote', emoji: '🍨' },
  { id: 'casquinha-de-sorvete', nome: 'Casquinha de sorvete', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['cone de sorvete', 'casquinha'], unidadePadrao: 'pacote', emoji: '🍦' },
  { id: 'sorvete-zero-acucar', nome: 'Sorvete zero açúcar', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['sorvete diet', 'sorvete light'], unidadePadrao: 'un', emoji: '🍨' },
  { id: 'gelato', nome: 'Gelato', categoria: 'congelados', subcategoria: 'Sorvetes', sinonimos: ['sorvete italiano', 'gelatto'], unidadePadrao: 'un', emoji: '🍨' },

  // --------------------------------------------------------- Massas e pães
  { id: 'pao-de-queijo-congelado', nome: 'Pão de queijo congelado', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['pao de queijo para assar', 'pao de queijo de pacote'], unidadePadrao: 'pacote', emoji: '🧀' },
  { id: 'pao-frances-congelado', nome: 'Pão francês congelado', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['pao para assar', 'pao pre assado'], unidadePadrao: 'pacote', emoji: '🥖' },
  { id: 'massa-folhada-congelada', nome: 'Massa folhada congelada', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['massa folhada de pacote'], unidadePadrao: 'pacote' },
  { id: 'nhoque-congelado', nome: 'Nhoque congelado', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['gnocchi congelado'], unidadePadrao: 'pacote' },
  { id: 'capeletti-congelado', nome: 'Capeletti congelado', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['capelete congelado', 'massa recheada congelada'], unidadePadrao: 'pacote' },
  { id: 'tapioca-congelada', nome: 'Tapioca congelada', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['disco de tapioca', 'tapioca pronta congelada'], unidadePadrao: 'pacote' },
  { id: 'waffle-congelado', nome: 'Waffle congelado', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['waffle para torradeira'], unidadePadrao: 'pacote' },
  { id: 'croissant-congelado', nome: 'Croissant congelado', categoria: 'congelados', subcategoria: 'Massas', sinonimos: ['croissant para assar'], unidadePadrao: 'pacote', emoji: '🥐' },
];

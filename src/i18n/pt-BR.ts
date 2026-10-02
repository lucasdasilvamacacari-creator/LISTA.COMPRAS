/**
 * Todos os textos da interface ficam aqui.
 * Se um dia o app precisar de outro idioma, basta criar um arquivo irmão
 * com o mesmo formato e trocar o import em `src/i18n/index.ts`.
 */
import { MAX_ITENS_ATIVOS } from '@/types';

export const t = {
  app: {
    nome: 'Lista de Mercado',
    nomeCompleto: 'Lista de Mercado da Família',
    carregando: 'Carregando…',
  },

  nav: {
    lista: 'Lista',
    explorar: 'Explorar',
    compartilhar: 'Compartilhar',
    ajustes: 'Ajustes',
  },

  status: {
    sincronizado: 'Sincronizado',
    sincronizando: 'Sincronizando',
    offline: 'Offline',
    offlineDetalhe: 'Alterações serão enviadas depois',
    pendente: 'Aguardando envio',
  },

  busca: {
    placeholder: 'O que está acabando?',
    placeholderCurto: 'Buscar produto',
    limpar: 'Limpar busca',
    vazia: 'Nenhum produto encontrado',
    criarPersonalizado: (texto: string) => `Adicionar “${texto}” como item personalizado`,
    adicionarDireto: 'Adicionar direto',
    abrirDetalhes: 'Abrir detalhes',
    voz: 'Falar o item',
    vozOuvindo: 'Ouvindo… fale os itens',
    vozErro: 'Não consegui ouvir. Tente de novo.',
    vozNaoSuportado: 'Entrada por voz não disponível neste navegador',
    vozAjuda: 'Dica: fale vários itens de uma vez, como “leite, ovos e pão”.',
    vozNadaEncontrado: 'Não reconheci nenhum produto no que você falou.',
    vozEncontrados: (n: number) => `${n} ${n === 1 ? 'item reconhecido' : 'itens reconhecidos'}`,
    chipFrequentes: 'Frequentes',
    resultados: 'Resultados da busca',
  },

  sheet: {
    titulo: 'Adicionar à lista',
    tituloEditar: 'Editar item',
    quantidade: 'Quantidade',
    diminuir: 'Diminuir quantidade',
    aumentar: 'Aumentar quantidade',
    unidade: 'Unidade',
    observacao: 'Observação (opcional)',
    observacaoPlaceholder: 'marca, “sem lactose”, “o mais maduro”, tamanho…',
    observacaoAjuda: 'Fica só entre vocês — escreva como quiser.',
    preco: 'Preço estimado (opcional)',
    precoPlaceholder: '0,00',
    adicionar: 'Adicionar',
    salvar: 'Salvar',
    cancelar: 'Cancelar',
    fechar: 'Fechar',
    categoria: 'Categoria',
  },

  lista: {
    titulo: 'Lista atual',
    progresso: (feitos: number, total: number) => `${feitos} de ${total} ${total === 1 ? 'item' : 'itens'}`,
    noCarrinho: 'No carrinho',
    vaziaTitulo: 'A lista está vazia',
    vaziaTexto: 'Busque um produto acima para começar. Todo mundo da família vê na hora.',
    vaziaAcao: 'Buscar produto',
    frequentesTitulo: 'Comprados com frequência',
    frequentesAcao: 'Adicionar de novo',
    frequentesVazio: 'Depois das primeiras compras, os itens mais pedidos aparecem aqui.',
    marcarComprado: 'Marcar como comprado',
    desmarcar: 'Desmarcar',
    editar: 'Editar',
    remover: 'Remover',
    adicionadoPor: (nome: string) => `adicionado por ${nome}`,
    limparComprados: 'Limpar comprados',
    limparCompradosConfirma:
      'Remover todos os itens já comprados da lista? Eles entram no histórico de frequentes.',
    novaLista: 'Esvaziar a lista',
    novaListaConfirma:
      'Isso remove TODOS os itens da lista, comprados ou não. Quer continuar?',
    recolher: 'Recolher categoria',
    expandir: 'Expandir categoria',
    limiteAtingido: `Esta lista chegou ao limite de ${MAX_ITENS_ATIVOS} itens ativos. Para adicionar mais, limpe os comprados ou remova o que não precisa.`,
    totalEstimado: 'Total estimado',
    semPreco: 'sem preço',
    itensNaCategoria: (n: number) => `${n} ${n === 1 ? 'item' : 'itens'}`,
  },

  compras: {
    titulo: 'Modo compras',
    entrar: 'Modo compras',
    sair: 'Sair do modo compras',
    telaLigada: 'Manter tela ligada',
    telaLigadaAtiva: 'Tela ficará ligada',
    telaLigadaNaoSuportado: 'Seu navegador não permite manter a tela ligada',
    ordemCorredores: 'Ordem dos corredores',
    ordemCorredoresAjuda: 'Arraste para deixar na ordem do seu mercado. Vale para toda a família.',
    moverAcima: 'Mover para cima',
    moverAbaixo: 'Mover para baixo',
    concluido: 'Tudo comprado! 🎉',
  },

  compartilhar: {
    titulo: 'Compartilhar lista',
    explicacao:
      'Quem abrir este link vê e edita a mesma lista, sem precisar criar conta. O link é a chave da lista — compartilhe só com a família.',
    link: 'Link da lista',
    copiar: 'Copiar link',
    copiado: 'Link copiado!',
    compartilharNativo: 'Compartilhar…',
    whatsapp: 'Enviar pelo WhatsApp',
    qrTitulo: 'Ou aponte a câmera',
    qrAlt: 'QR Code com o link da lista',
    codigo: 'Código da lista',
    copiarCodigo: 'Copiar código',
    mensagemConvite: (nome: string, url: string) =>
      `Nossa lista do mercado “${nome}”: ${url}\n\nAbra o link, adicione o que estiver faltando e todo mundo vê na hora.`,
  },

  entrar: {
    titulo: 'Entrar em uma lista',
    explicacao: 'Cole o link que a sua família te enviou, ou digite só o código da lista.',
    campo: 'Link ou código',
    campoPlaceholder: 'https://… ou o código da lista',
    acao: 'Entrar',
    invalido: 'Não encontrei um código válido nesse texto.',
    naoEncontrada: 'Lista não encontrada',
    naoEncontradaTexto:
      'Esse código não existe (ou foi digitado errado). Confira o link com quem te enviou.',
    criarNova: 'Criar uma lista nova',
    colarOutro: 'Colar outro link',
    precisaInternet: 'Para entrar em uma lista pela primeira vez você precisa de internet.',
  },

  minhasListas: {
    titulo: 'Minhas listas',
    explicacao:
      'As listas que você já abriu neste aparelho. Guarde o link em outro lugar também: se você limpar os dados do navegador, essa lista aqui se perde.',
    vazio: 'Nenhuma outra lista salva neste aparelho.',
    abrir: 'Abrir',
    esquecer: 'Esquecer',
    esquecerConfirma:
      'Isso só apaga o atalho aqui no aparelho. A lista continua existindo para quem tem o link.',
    criar: 'Criar nova lista',
    criarNome: 'Nome da lista',
    criarNomePlaceholder: 'Mercado, Feira, Farmácia…',
    trocar: 'Trocar de lista',
  },

  explorar: {
    titulo: 'Explorar',
    subtitulo: 'Toque numa categoria para ver os produtos.',
    voltar: 'Voltar',
    todas: 'Todas',
    vazio: 'Nada aqui ainda.',
    produtos: (n: number) => `${n} ${n === 1 ? 'produto' : 'produtos'}`,
  },

  ajustes: {
    titulo: 'Ajustes',
    seuNome: 'Seu nome (opcional)',
    seuNomePlaceholder: 'Maria',
    seuNomeAjuda: 'Fica salvo só neste aparelho e aparece como “adicionado por Maria”.',
    tema: 'Aparência',
    temaAuto: 'Automático',
    temaClaro: 'Claro',
    temaEscuro: 'Escuro',
    precos: 'Mostrar preço estimado',
    precosAjuda: 'Adiciona um campo de preço por item e um total aproximado.',
    renomearLista: 'Nome desta lista',
    privacidade: 'Privacidade',
    instalar: 'Instalar o aplicativo',
    sobre: 'Sobre',
    versao: 'Versão',
    armazenamento: 'Armazenamento',
    armazenamentoPersistente: 'Dados protegidos neste aparelho',
    armazenamentoNormal: 'Proteção de dados não concedida pelo navegador',
  },

  privacidade: {
    titulo: 'Privacidade',
    corpo: [
      'Este aplicativo não pede login, não pede e-mail e não usa nenhum serviço de análise de terceiros.',
      'A única informação pessoal guardada é o nome que você escolher digitar em Ajustes — e ele serve apenas para mostrar “adicionado por Maria” para a sua família.',
      'O endereço (link) da lista funciona como uma chave: QUALQUER PESSOA com o link consegue ver e editar a lista. Não publique o link em grupos abertos ou redes sociais.',
      'A lista fica guardada no Firebase (Google) e também no seu aparelho, para funcionar offline. Para apagar tudo, esvazie a lista e esqueça-a em "Minhas listas".',
      'Não há cobrança, anúncio ou venda de dados. O código é aberto.',
    ],
  },

  instalar: {
    bannerTitulo: 'Instalar na tela de início',
    bannerTexto: 'Abre mais rápido, funciona offline e fica com cara de aplicativo.',
    instalarAgora: 'Instalar',
    depois: 'Depois',
    naoMostrarMais: 'Não mostrar de novo',
    iosTitulo: 'Instalar no iPhone ou iPad',
    iosPassos: [
      'Toque no botão Compartilhar, na barra do Safari.',
      'Role a lista de opções e toque em “Adicionar à Tela de Início”.',
      'Confirme em “Adicionar”, no canto superior direito.',
    ],
    iosObs:
      'No iPhone o próprio Safari precisa fazer isso — nenhum site pode instalar sozinho. Depois de instalado, o app abre em tela cheia e funciona offline.',
    jaInstalado: 'O aplicativo já está instalado neste aparelho.',
  },

  atualizacao: {
    titulo: 'Nova versão disponível',
    texto: 'Atualize para pegar as últimas melhorias.',
    acao: 'Atualizar',
    depois: 'Depois',
    offlinePronto: 'Pronto para usar offline.',
  },

  exportar: {
    whatsapp: 'Enviar pelo WhatsApp',
    copiar: 'Copiar lista',
    copiado: 'Lista copiada!',
    cabecalho: (nome: string) => `🛒 ${nome}`,
  },

  toast: {
    adicionado: (nome: string) => `${nome} na lista`,
    jaNaLista: 'Já está na lista, aumentei a quantidade (+1)',
    removido: (nome: string) => `${nome} removido`,
    comprado: (nome: string) => `${nome} no carrinho`,
    desmarcado: (nome: string) => `${nome} volta para a lista`,
    compradosLimpos: (n: number) => `${n} ${n === 1 ? 'item' : 'itens'} ${n === 1 ? 'saiu' : 'saíram'} da lista`,
    listaEsvaziada: 'Lista esvaziada',
    desfazer: 'Desfazer',
    desfeito: 'Desfeito',
    personalizadoCriado: (nome: string) => `${nome} criado e adicionado`,
    fechar: 'Fechar aviso',
  },

  erro: {
    generico: 'Algo deu errado. Tente de novo.',
    semConexaoPrimeiraVez:
      'Para criar a primeira lista você precisa de internet. Depois disso o app funciona offline.',
    falhaCriarLista: 'Não consegui criar a lista. Verifique sua conexão e tente de novo.',
    falhaEntrar: 'Não consegui abrir essa lista. Verifique sua conexão e tente de novo.',
    falhaSalvar: 'Não consegui salvar agora. A alteração será enviada quando a conexão voltar.',
    firebaseNaoConfigurado: 'Firebase não configurado',
    firebaseNaoConfiguradoTexto:
      'Preencha o arquivo .env com as chaves do seu projeto Firebase (veja o README) e recarregue a página.',
    recarregar: 'Recarregar',
    tentarNovamente: 'Tentar de novo',
    telaQuebrou: 'Essa tela travou',
    telaQuebrouTexto: 'Você pode recarregar sem perder a lista — ela está salva.',
  },

  categorias: {
    hortifruti: 'Hortifrúti',
    acougue: 'Açougue',
    peixaria: 'Peixaria e frutos do mar',
    'frios-laticinios': 'Frios e laticínios',
    padaria: 'Padaria e confeitaria',
    mercearia: 'Mercearia',
    'matinais-doces': 'Matinais e doces',
    'biscoitos-snacks': 'Biscoitos e snacks',
    bebidas: 'Bebidas',
    congelados: 'Congelados',
    saudaveis: 'Saudáveis e naturais',
    'bebe-infantil': 'Bebê e infantil',
    higiene: 'Higiene pessoal',
    limpeza: 'Limpeza',
    descartaveis: 'Descartáveis e utilidades',
    pet: 'Pet',
    churrasco: 'Churrasco',
    outros: 'Outros',
  } as const,

  a11y: {
    menu: 'Abrir menu',
    fechar: 'Fechar',
    voltar: 'Voltar',
    status: 'Status de sincronização',
  },
} as const;

export type Textos = typeof t;

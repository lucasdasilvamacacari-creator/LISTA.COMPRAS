/**
 * Tela principal — costura busca, lista, modo compras e as telas auxiliares.
 *
 * O fluxo de adicionar é o coração do app, então ele vive aqui, perto do
 * estado: digitar → sugestão → "+" (ou sheet) → item na lista, com toast de
 * desfazer e feedback háptico.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Copy,
  ListChecks,
  MessageCircle,
  Compass,
  Settings,
  Share2,
  ShoppingBasket,
  ShoppingCart,
  Sun,
  Trash2,
} from 'lucide-react';

import { BarraBusca } from '@/components/BarraBusca';
import { Sugestoes } from '@/components/Sugestoes';
import { SheetItem, type DadosSheet } from '@/components/SheetItem';
import { ListaItens } from '@/components/ListaItens';
import { Progresso } from '@/components/Progresso';
import { Frequentes } from '@/components/Frequentes';
import { Explorar } from '@/components/Explorar';
import { Compartilhar } from '@/components/Compartilhar';
import { Ajustes } from '@/components/Ajustes';
import { Privacidade } from '@/components/Privacidade';
import { MinhasListas } from '@/components/MinhasListas';
import { BottomSheet } from '@/components/BottomSheet';
import { StatusSync } from '@/components/StatusSync';
import { EstadoVazio } from '@/components/EstadoVazio';
import { ListaSkeleton } from '@/components/Skeleton';
import { BannerInstalar, TutorialIos } from '@/components/Instalar';
import { useToast } from '@/hooks/useToast';

import { useList, statusSync } from '@/hooks/useList';
import { useListaAtiva, urlDaLista } from '@/hooks/useListaAtiva';
import { useCatalogSearch } from '@/hooks/useCatalogSearch';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useVoz } from '@/hooks/useVoz';

import {
  adicionarItem,
  ajustarQuantidade,
  editarItem,
  esvaziarLista,
  limparComprados,
  limparItensAntigos,
  marcarComprado,
  removerItem,
  renomearLista,
  restaurarItem,
  restaurarVarios,
  salvarOrdemCorredores,
  salvarProdutoPersonalizado,
} from '@/lib/listRepo';
import { garantirLogin, pedirArmazenamentoPersistente } from '@/lib/firebase';
import { listaComoTexto, totalEstimado } from '@/lib/exportar';
import { copiar, urlWhatsApp, vibrar } from '@/lib/dispositivo';
import { separarItensFalados } from '@/lib/texto';
import { itemIdDoCatalogo, itemIdPersonalizado } from '@/lib/ids';
import {
  definirCategoriasRecolhidas,
  definirMostrarPrecos,
  definirNome,
  deveLimparAntigos,
  marcarLimpezaFeita,
  obterCategoriasRecolhidas,
  obterMostrarPrecos,
  obterNome,
  obterTema,
  type PreferenciaTema,
} from '@/lib/armazenamentoLocal';
import { t } from '@/i18n';
import { MAX_ITENS_ATIVOS, type CategoriaId, type Item, type Produto } from '@/types';

type Aba = 'lista' | 'explorar';
type Painel = null | 'compartilhar' | 'ajustes' | 'listas' | 'privacidade';

interface AlvoSheet {
  produto?: Produto;
  nomeLivre?: string;
  item?: Item;
}

export default function App(): JSX.Element {
  const { mostrar, erro: mostrarErro } = useToast();
  const online = useOnlineStatus();
  const wakeLock = useWakeLock();

  const {
    listId,
    salvas,
    resolvendo,
    criar,
    entrar,
    abrir,
    esquecer,
    registrarNome,
  } = useListaAtiva();

  const estado = useList(listId);
  const { lista, itens, todosItens, personalizados, historico, carregando, naoEncontrada } = estado;

  const [aba, setAba] = useState<Aba>('lista');
  const [painel, setPainel] = useState<Painel>(null);
  const [consulta, setConsulta] = useState('');
  const [alvoSheet, setAlvoSheet] = useState<AlvoSheet | null>(null);
  const [modoCompras, setModoCompras] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState(() => obterNome());
  const [tema, setTema] = useState<PreferenciaTema>(() => obterTema());
  const [mostrarPrecos, setMostrarPrecos] = useState(() => obterMostrarPrecos());
  const [armazenamentoOk, setArmazenamentoOk] = useState(false);
  const [recolhidas, setRecolhidas] = useState<Set<string>>(new Set());
  const [copiadoLista, setCopiadoLista] = useState(false);
  const campoBuscaRef = useRef<HTMLInputElement>(null);

  // --- Autenticação anônima e armazenamento persistente --------------------
  useEffect(() => {
    void garantirLogin().catch((e) => {
      console.error('[auth] falha no login anônimo:', e);
    });
    void pedirArmazenamentoPersistente().then(setArmazenamentoOk);
  }, []);

  // --- Atalhos do manifest (?acao=adicionar | compras) ----------------------
  useEffect(() => {
    const acao = new URL(window.location.href).searchParams.get('acao');
    if (acao === 'adicionar') window.setTimeout(() => campoBuscaRef.current?.focus(), 400);
    if (acao === 'compras') setModoCompras(true);
  }, []);

  // --- Categorias recolhidas, por lista ------------------------------------
  useEffect(() => {
    if (!listId) return;
    setRecolhidas(new Set(obterCategoriasRecolhidas(listId)));
  }, [listId]);

  // --- Limpeza dos apagados há mais de 30 dias (uma vez por dia, online) ----
  useEffect(() => {
    if (!listId || !online || carregando) return;
    if (!deveLimparAntigos()) return;
    const temporizador = window.setTimeout(() => {
      void limparItensAntigos(listId)
        .then(() => marcarLimpezaFeita())
        .catch(() => undefined);
    }, 8000);
    return () => window.clearTimeout(temporizador);
  }, [listId, online, carregando]);

  // --- Mantém "Minhas listas" com o nome atual da lista --------------------
  useEffect(() => {
    if (listId && lista?.name) registrarNome(listId, lista.name);
  }, [listId, lista?.name, registrarNome]);

  // --- Derivados ------------------------------------------------------------
  const ativos = useMemo(() => itens.filter((i) => !i.deleted), [itens]);
  const comprados = useMemo(() => ativos.filter((i) => i.checked), [ativos]);

  /** ids que já estão na lista, para marcar na busca e nos frequentes. */
  const idsNaLista = useMemo(
    () => new Set(ativos.map((i) => i.catalogId ?? i.id)),
    [ativos],
  );

  /** ids mais comprados, que a busca usa para subir resultados. */
  const idsFrequentes = useMemo(
    () =>
      historico
        .filter((h) => h.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 40)
        .map((h) => h.catalogId ?? h.id),
    [historico],
  );

  const busca = useCatalogSearch(consulta, personalizados, idsFrequentes);

  /** Acha o documento (mesmo apagado/comprado) para decidir criar × reviver. */
  const acharDocumento = useCallback(
    (itemId: string): Item | null => todosItens.find((i) => i.id === itemId) ?? null,
    [todosItens],
  );

  const status = statusSync(online, estado.temEscritasPendentes, estado.doCache);
  const estimado = mostrarPrecos ? totalEstimado(ativos) : null;

  // --- Ações da lista -------------------------------------------------------

  const noLimite = ativos.length >= MAX_ITENS_ATIVOS;

  const adicionar = useCallback(
    async (dados: {
      produto?: Produto;
      nome?: string;
      categoria?: CategoriaId;
      qtd?: number;
      unidade?: Item['unit'];
      observacao?: string;
      preco?: number;
    }): Promise<void> => {
      if (!listId) return;

      // O itemId tem de ser calculado do MESMO jeito que o listRepo calcula,
      // senão não encontramos o documento existente e o revive de um item
      // apagado/comprado não acontece (ele voltaria com a quantidade antiga).
      let itemId: string | null = null;
      if (dados.produto) {
        itemId = itemIdDoCatalogo(dados.produto.id);
      } else if (dados.nome?.trim()) {
        try {
          itemId = itemIdPersonalizado(dados.nome);
        } catch {
          mostrarErro(t.erro.generico);
          return;
        }
      }
      if (!itemId) return;

      const existente = acharDocumento(itemId);

      // O limite só bloqueia item NOVO: aumentar quantidade sempre é permitido.
      const ehNovo = !existente || existente.deleted || existente.checked;
      if (noLimite && ehNovo) {
        mostrarErro(t.lista.limiteAtingido);
        return;
      }

      try {
        const resultado = await adicionarItem(
          listId,
          {
            ...(dados.produto ? { produto: dados.produto } : {}),
            ...(dados.nome ? { nome: dados.nome } : {}),
            ...(dados.categoria ? { categoria: dados.categoria } : {}),
            ...(dados.unidade ? { unidade: dados.unidade } : {}),
            ...(dados.observacao ? { observacao: dados.observacao } : {}),
            ...(typeof dados.preco === 'number' ? { preco: dados.preco } : {}),
            qtd: dados.qtd ?? 1,
            autor: nomeUsuario || null,
          },
          existente,
        );

        vibrar(14);

        if (resultado.jaExistia) {
          mostrar({
            texto: t.toast.jaNaLista,
            desfazer: () =>
              ajustarQuantidade(listId, resultado.itemId, -resultado.incremento).catch(
                () => undefined,
              ),
          });
        } else {
          mostrar({
            texto: t.toast.adicionado(resultado.nome),
            desfazer: () => removerItem(listId, resultado.itemId).catch(() => undefined),
          });
        }
      } catch (e) {
        console.error('[lista] falha ao adicionar:', e);
        mostrarErro(t.erro.falhaSalvar);
      }
    },
    [listId, acharDocumento, noLimite, nomeUsuario, mostrar, mostrarErro],
  );

  const alternarComprado = useCallback(
    async (item: Item): Promise<void> => {
      if (!listId) return;
      const novoValor = !item.checked;
      try {
        await marcarComprado(listId, item.id, novoValor, nomeUsuario || null);
        mostrar({
          texto: novoValor ? t.toast.comprado(item.name) : t.toast.desmarcado(item.name),
          desfazer: () =>
            marcarComprado(listId, item.id, !novoValor, nomeUsuario || null).catch(() => undefined),
          duracaoMs: 3500,
        });
      } catch (e) {
        console.error('[lista] falha ao marcar:', e);
        mostrarErro(t.erro.falhaSalvar);
      }
    },
    [listId, nomeUsuario, mostrar, mostrarErro],
  );

  const remover = useCallback(
    async (item: Item): Promise<void> => {
      if (!listId) return;
      try {
        await removerItem(listId, item.id);
        vibrar(10);
        mostrar({
          texto: t.toast.removido(item.name),
          desfazer: () =>
            restaurarItem(listId, item.id, item.qty, item.checked).catch(() => undefined),
        });
      } catch (e) {
        console.error('[lista] falha ao remover:', e);
        mostrarErro(t.erro.falhaSalvar);
      }
    },
    [listId, mostrar, mostrarErro],
  );

  const limpar = useCallback(async (): Promise<void> => {
    if (!listId || comprados.length === 0) return;
    if (!window.confirm(t.lista.limparCompradosConfirma)) return;
    try {
      const afetados = await limparComprados(listId, ativos);
      mostrar({
        texto: t.toast.compradosLimpos(afetados.length),
        desfazer: () => restaurarVarios(listId, afetados).catch(() => undefined),
      });
    } catch (e) {
      console.error('[lista] falha ao limpar:', e);
      mostrarErro(t.erro.falhaSalvar);
    }
  }, [listId, ativos, comprados.length, mostrar, mostrarErro]);

  const esvaziar = useCallback(async (): Promise<void> => {
    if (!listId || ativos.length === 0) return;
    if (!window.confirm(t.lista.novaListaConfirma)) return;
    try {
      const afetados = await esvaziarLista(listId, ativos);
      mostrar({
        texto: t.toast.listaEsvaziada,
        desfazer: () => restaurarVarios(listId, afetados).catch(() => undefined),
      });
    } catch (e) {
      console.error('[lista] falha ao esvaziar:', e);
      mostrarErro(t.erro.falhaSalvar);
    }
  }, [listId, ativos, mostrar, mostrarErro]);

  const criarPersonalizado = useCallback(
    async (texto: string): Promise<void> => {
      if (!listId) return;
      try {
        await salvarProdutoPersonalizado(listId, texto, 'outros', 'un', nomeUsuario || null);
        await adicionar({ nome: texto, categoria: 'outros' });
        setConsulta('');
      } catch (e) {
        console.error('[lista] falha ao criar personalizado:', e);
        mostrarErro(t.erro.falhaSalvar);
      }
    },
    [listId, nomeUsuario, adicionar, mostrarErro],
  );

  // --- Voz: reconhece vários itens de uma vez ------------------------------
  const voz = useVoz(
    useCallback((texto: string) => {
      setConsulta(texto);
    }, []),
  );

  const [textoFalado, setTextoFalado] = useState<string | null>(null);

  useEffect(() => {
    // Quando o microfone encerra e sobrou texto, tentamos casar vários itens.
    if (voz.ouvindo || !textoFalado) return;
    const trechos = separarItensFalados(textoFalado);
    setTextoFalado(null);
    if (trechos.length <= 1) return;

    void busca.casarFala(trechos).then(async (produtos) => {
      if (produtos.length === 0) {
        mostrarErro(t.busca.vozNadaEncontrado);
        return;
      }
      for (const produto of produtos) await adicionar({ produto });
      mostrar({ texto: t.busca.vozEncontrados(produtos.length) });
      setConsulta('');
    });
  }, [voz.ouvindo, textoFalado, busca, adicionar, mostrar, mostrarErro]);

  useEffect(() => {
    if (voz.ouvindo && voz.parcial) setTextoFalado(voz.parcial);
  }, [voz.ouvindo, voz.parcial]);

  // --- Exportar -------------------------------------------------------------
  const textoDaLista = useMemo(
    () => listaComoTexto(lista?.name ?? 'Mercado', ativos, lista?.aisleOrder ?? []),
    [lista?.name, lista?.aisleOrder, ativos],
  );

  async function copiarLista(): Promise<void> {
    if (await copiar(textoDaLista)) {
      setCopiadoLista(true);
      window.setTimeout(() => setCopiadoLista(false), 2000);
      mostrar({ texto: t.exportar.copiado });
    }
  }

  function alternarCategoria(categoria: string): void {
    setRecolhidas((atuais) => {
      const nova = new Set(atuais);
      if (nova.has(categoria)) nova.delete(categoria);
      else nova.add(categoria);
      if (listId) definirCategoriasRecolhidas(listId, [...nova]);
      return nova;
    });
  }

  // --- Telas de exceção ------------------------------------------------------

  if (resolvendo) {
    return (
      <div className="mx-auto max-w-2xl px-4 pt-8">
        <ListaSkeleton />
      </div>
    );
  }

  // Nenhuma lista ainda (primeiro uso) ou lista inexistente.
  if (!listId || naoEncontrada) {
    return (
      <main className="mx-auto min-h-dvh max-w-2xl px-4 pb-10 safe-top">
        <header className="py-6">
          <h1 className="text-2xl font-semibold">{t.app.nomeCompleto}</h1>
        </header>

        {naoEncontrada && (
          <div className="card mb-6 p-5">
            <h2 className="text-base font-semibold text-danger">{t.entrar.naoEncontrada}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-base-500">
              {t.entrar.naoEncontradaTexto}
            </p>
          </div>
        )}

        <MinhasListas
          listaAtual={listId}
          salvas={salvas}
          online={online}
          onAbrir={abrir}
          onEsquecer={esquecer}
          onCriar={async (nome) => {
            try {
              await criar(nome);
            } catch {
              mostrarErro(t.erro.falhaCriarLista);
            }
          }}
          onEntrar={async (alvo) => {
            const ok = await entrar(alvo);
            if (!ok) mostrarErro(t.entrar.naoEncontradaTexto);
          }}
        />
      </main>
    );
  }

  // --- Tela principal --------------------------------------------------------

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-30 bg-base-50/90 px-4 pb-3 backdrop-blur-md safe-top">
        <div className="flex items-center gap-2 py-3">
          <button
            type="button"
            onClick={() => setPainel('listas')}
            className="min-w-0 flex-1 text-left"
            aria-label={t.minhasListas.trocar}
          >
            <h1 className="truncate text-lg font-semibold leading-tight">
              {lista?.name ?? t.app.nome}
            </h1>
          </button>

          <StatusSync status={status} />

          <button
            type="button"
            onClick={() => setModoCompras((v) => !v)}
            aria-pressed={modoCompras}
            aria-label={modoCompras ? t.compras.sair : t.compras.entrar}
            className={`tap rounded-xl ${
              modoCompras
                ? 'bg-accent-100 text-accent-700'
                : 'text-base-700 hover:bg-base-100'
            }`}
          >
            <ShoppingCart size={19} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setPainel('compartilhar')}
            aria-label={t.compartilhar.titulo}
            className="tap rounded-xl text-base-700 hover:bg-base-100"
          >
            <Share2 size={19} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setPainel('ajustes')}
            aria-label={t.ajustes.titulo}
            className="tap -mr-2 rounded-xl text-base-700 hover:bg-base-100"
          >
            <Settings size={19} aria-hidden="true" />
          </button>
        </div>

        {/* Busca: escondida no modo compras, onde o que importa é marcar itens. */}
        {!modoCompras && (
          <BarraBusca
            ref={campoBuscaRef}
            valor={consulta}
            onChange={setConsulta}
            vozSuportada={voz.suportado}
            ouvindo={voz.ouvindo}
            onVoz={voz.iniciar}
          />
        )}
      </header>

      <main className="flex-1 px-4 pb-28">
        {/* Resultados da busca ficam por cima de tudo */}
        {!modoCompras && consulta.trim().length > 0 ? (
          <div className="pt-3">
            <Sugestoes
              consulta={consulta}
              resultados={busca.resultados}
              buscando={busca.buscando}
              naLista={idsNaLista}
              onEscolher={(r) => setAlvoSheet({ produto: r.produto })}
              onAdicionarDireto={(r) => {
                void adicionar({ produto: r.produto });
                setConsulta('');
              }}
              onCriarPersonalizado={(texto) => void criarPersonalizado(texto)}
            />
          </div>
        ) : aba === 'explorar' && !modoCompras ? (
          <div className="pt-4">
            <Explorar
              naLista={idsNaLista}
              onEscolher={(produto) => setAlvoSheet({ produto })}
              onAdicionarDireto={(produto) => void adicionar({ produto })}
            />
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            {!modoCompras && <BannerInstalar />}
            {!modoCompras && <TutorialIos />}

            {!modoCompras && (
              <Frequentes
                historico={historico}
                naLista={idsNaLista}
                onAdicionar={(h) =>
                  void adicionar({
                    nome: h.name,
                    categoria: h.category,
                    unidade: h.unit,
                  })
                }
              />
            )}

            <Progresso feitos={comprados.length} total={ativos.length} totalEstimado={estimado} />

            {modoCompras && wakeLock.suportado && (
              <label className="card flex cursor-pointer items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={wakeLock.ativo}
                  onChange={(e) => void wakeLock.alternar(e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-[rgb(var(--c-accent-500))]"
                />
                <Sun size={16} className="shrink-0 text-base-500" aria-hidden="true" />
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {wakeLock.ativo ? t.compras.telaLigadaAtiva : t.compras.telaLigada}
                </span>
              </label>
            )}

            {carregando && ativos.length === 0 ? (
              <ListaSkeleton />
            ) : ativos.length === 0 ? (
              <div className="card">
                <EstadoVazio
                  Icone={ShoppingBasket}
                  titulo={t.lista.vaziaTitulo}
                  texto={t.lista.vaziaTexto}
                  acao={{
                    rotulo: t.lista.vaziaAcao,
                    onClick: () => campoBuscaRef.current?.focus(),
                  }}
                />
              </div>
            ) : (
              <>
                <ListaItens
                  itens={ativos}
                  ordemCorredores={lista?.aisleOrder ?? []}
                  recolhidas={recolhidas}
                  mostrarPrecos={mostrarPrecos}
                  onAlternarCategoria={alternarCategoria}
                  onAlternarItem={(item) => void alternarComprado(item)}
                  onEditar={(item) => setAlvoSheet({ item })}
                  onRemover={(item) => void remover(item)}
                />

                {/* Ações da lista */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={urlWhatsApp(textoDaLista)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chip"
                  >
                    <MessageCircle size={14} aria-hidden="true" />
                    {t.exportar.whatsapp}
                  </a>

                  <button type="button" onClick={() => void copiarLista()} className="chip">
                    {copiadoLista ? (
                      <Check size={14} className="text-accent-600" aria-hidden="true" />
                    ) : (
                      <Copy size={14} aria-hidden="true" />
                    )}
                    {t.exportar.copiar}
                  </button>

                  {comprados.length > 0 && (
                    <button type="button" onClick={() => void limpar()} className="chip">
                      <ListChecks size={14} aria-hidden="true" />
                      {t.lista.limparComprados}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => void esvaziar()}
                    className="chip text-danger hover:bg-danger/5"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    {t.lista.novaLista}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Navegação inferior: alvo grande, ao alcance do polegar */}
      {!modoCompras && (
        <nav
          className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-2xl justify-around
                     border-t border-base-200 bg-base-0/95 px-2 pt-1 backdrop-blur-md safe-bottom"
          aria-label={t.nav.lista}
        >
          {([
            { id: 'lista' as const, rotulo: t.nav.lista, Icone: ShoppingBasket },
            { id: 'explorar' as const, rotulo: t.nav.explorar, Icone: Compass },
          ]).map(({ id, rotulo, Icone }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setAba(id);
                setConsulta('');
              }}
              aria-current={aba === id ? 'page' : undefined}
              className={`flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-medium ${
                aba === id ? 'text-accent-600' : 'text-base-500'
              }`}
            >
              <Icone size={20} aria-hidden="true" />
              {rotulo}
            </button>
          ))}
        </nav>
      )}

      {/* Sheet de adicionar/editar */}
      <SheetItem
        aberto={alvoSheet !== null}
        produto={alvoSheet?.produto ?? null}
        {...(alvoSheet?.nomeLivre ? { nomeLivre: alvoSheet.nomeLivre } : {})}
        item={alvoSheet?.item ?? null}
        mostrarPrecos={mostrarPrecos}
        onFechar={() => setAlvoSheet(null)}
        onConfirmar={async (dados: DadosSheet) => {
          if (!listId) return;
          if (alvoSheet?.item) {
            await editarItem(listId, alvoSheet.item.id, {
              qtd: dados.qtd,
              unidade: dados.unidade,
              observacao: dados.observacao,
              ...(typeof dados.preco === 'number' ? { preco: dados.preco } : {}),
            });
          } else {
            await adicionar({
              ...(alvoSheet?.produto ? { produto: alvoSheet.produto } : {}),
              ...(alvoSheet?.nomeLivre ? { nome: alvoSheet.nomeLivre } : {}),
              qtd: dados.qtd,
              unidade: dados.unidade,
              observacao: dados.observacao,
              ...(typeof dados.preco === 'number' ? { preco: dados.preco } : {}),
            });
            setConsulta('');
          }
          setAlvoSheet(null);
        }}
      />

      {/* Painéis auxiliares */}
      <BottomSheet
        aberto={painel === 'compartilhar'}
        titulo={t.compartilhar.titulo}
        onFechar={() => setPainel(null)}
      >
        <div className="pb-4">
          <Compartilhar
            listId={listId}
            nomeLista={lista?.name ?? 'Mercado'}
            url={urlDaLista(listId)}
          />
        </div>
      </BottomSheet>

      <BottomSheet
        aberto={painel === 'ajustes'}
        titulo={t.ajustes.titulo}
        onFechar={() => setPainel(null)}
      >
        <Ajustes
          nome={nomeUsuario}
          onNome={(novo) => {
            definirNome(novo);
            setNomeUsuario(novo);
          }}
          tema={tema}
          onTema={setTema}
          mostrarPrecos={mostrarPrecos}
          onMostrarPrecos={(ativo) => {
            definirMostrarPrecos(ativo);
            setMostrarPrecos(ativo);
          }}
          nomeLista={lista?.name ?? 'Mercado'}
          onNomeLista={(novo) => void renomearLista(listId, novo).catch(() => undefined)}
          ordemCorredores={lista?.aisleOrder ?? []}
          onOrdemCorredores={(ordem) =>
            void salvarOrdemCorredores(listId, ordem).catch(() => undefined)
          }
          armazenamentoPersistente={armazenamentoOk}
          onAbrirPrivacidade={() => setPainel('privacidade')}
        />
      </BottomSheet>

      <BottomSheet
        aberto={painel === 'listas'}
        titulo={t.minhasListas.titulo}
        onFechar={() => setPainel(null)}
      >
        <MinhasListas
          listaAtual={listId}
          salvas={salvas}
          online={online}
          onAbrir={(alvo) => {
            abrir(alvo);
            setPainel(null);
          }}
          onEsquecer={esquecer}
          onCriar={async (nome) => {
            try {
              await criar(nome);
              setPainel(null);
            } catch {
              mostrarErro(t.erro.falhaCriarLista);
            }
          }}
          onEntrar={async (alvo) => {
            const ok = await entrar(alvo);
            if (ok) setPainel(null);
            else mostrarErro(t.entrar.naoEncontradaTexto);
          }}
        />
      </BottomSheet>

      <BottomSheet
        aberto={painel === 'privacidade'}
        titulo={t.privacidade.titulo}
        onFechar={() => setPainel('ajustes')}
      >
        <Privacidade />
      </BottomSheet>
    </div>
  );
}

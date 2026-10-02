/**
 * Tudo que o app guarda no aparelho (localStorage).
 *
 * Nada aqui é sensível: é a lista aberta, o nome que o usuário escolheu e
 * algumas preferências. Toda leitura/escrita é protegida com try/catch porque
 * em modo privado o localStorage pode simplesmente lançar exceção.
 */
import type { ListaSalva } from '@/types';

const CHAVE_LISTA_ATUAL = 'lmf:listaAtual';
const CHAVE_MINHAS_LISTAS = 'lmf:minhasListas';
const CHAVE_NOME = 'lmf:nome';
const CHAVE_TEMA = 'lmf:tema';
const CHAVE_PRECOS = 'lmf:precos';
const CHAVE_DICA_IOS = 'lmf:dicaIos';
const CHAVE_BANNER_INSTALAR = 'lmf:bannerInstalar';
const CHAVE_ULTIMA_LIMPEZA = 'lmf:ultimaLimpeza';
const CHAVE_CATEGORIAS_RECOLHIDAS = 'lmf:recolhidas';

function ler(chave: string): string | null {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

function escrever(chave: string, valor: string): void {
  try {
    localStorage.setItem(chave, valor);
  } catch {
    /* storage cheio ou bloqueado: seguimos sem persistir */
  }
}

function apagar(chave: string): void {
  try {
    localStorage.removeItem(chave);
  } catch {
    /* ignora */
  }
}

function lerJson<T>(chave: string, padrao: T): T {
  const bruto = ler(chave);
  if (!bruto) return padrao;
  try {
    return JSON.parse(bruto) as T;
  } catch {
    return padrao;
  }
}

// --- Lista atual -----------------------------------------------------------

export function obterListaAtual(): string | null {
  return ler(CHAVE_LISTA_ATUAL);
}

export function definirListaAtual(listId: string): void {
  escrever(CHAVE_LISTA_ATUAL, listId);
}

// --- Minhas listas ---------------------------------------------------------

export function obterMinhasListas(): ListaSalva[] {
  const lista = lerJson<ListaSalva[]>(CHAVE_MINHAS_LISTAS, []);
  if (!Array.isArray(lista)) return [];
  return lista
    .filter((l): l is ListaSalva => typeof l?.id === 'string' && typeof l?.nome === 'string')
    .sort((a, b) => (b.ultimoAcesso ?? 0) - (a.ultimoAcesso ?? 0));
}

export function salvarMinhaLista(id: string, nome: string): void {
  const atuais = obterMinhasListas().filter((l) => l.id !== id);
  atuais.unshift({ id, nome, ultimoAcesso: Date.now() });
  escrever(CHAVE_MINHAS_LISTAS, JSON.stringify(atuais.slice(0, 30)));
}

export function esquecerMinhaLista(id: string): void {
  const restantes = obterMinhasListas().filter((l) => l.id !== id);
  escrever(CHAVE_MINHAS_LISTAS, JSON.stringify(restantes));
  if (obterListaAtual() === id) apagar(CHAVE_LISTA_ATUAL);
}

// --- Nome do usuário -------------------------------------------------------

export function obterNome(): string {
  return ler(CHAVE_NOME) ?? '';
}

export function definirNome(nome: string): void {
  const limpo = nome.trim().slice(0, 40);
  if (limpo) escrever(CHAVE_NOME, limpo);
  else apagar(CHAVE_NOME);
}

// --- Tema ------------------------------------------------------------------

export type PreferenciaTema = 'auto' | 'claro' | 'escuro';

export function obterTema(): PreferenciaTema {
  const valor = ler(CHAVE_TEMA);
  return valor === 'claro' || valor === 'escuro' ? valor : 'auto';
}

export function definirTema(tema: PreferenciaTema): void {
  escrever(CHAVE_TEMA, tema);
}

// --- Preço estimado (recurso opcional) -------------------------------------

export function obterMostrarPrecos(): boolean {
  return ler(CHAVE_PRECOS) === 'true';
}

export function definirMostrarPrecos(ativo: boolean): void {
  escrever(CHAVE_PRECOS, String(ativo));
}

// --- Dicas de instalação ---------------------------------------------------

export function dicaIosDispensada(): boolean {
  return ler(CHAVE_DICA_IOS) === 'nao';
}

export function dispensarDicaIos(): void {
  escrever(CHAVE_DICA_IOS, 'nao');
}

export function bannerInstalarDispensado(): boolean {
  return ler(CHAVE_BANNER_INSTALAR) === 'nao';
}

export function dispensarBannerInstalar(): void {
  escrever(CHAVE_BANNER_INSTALAR, 'nao');
}

// --- Limpeza periódica -----------------------------------------------------

/** `true` quando já passou um dia desde a última limpeza neste aparelho. */
export function deveLimparAntigos(): boolean {
  const ultima = Number(ler(CHAVE_ULTIMA_LIMPEZA) ?? 0);
  return !Number.isFinite(ultima) || Date.now() - ultima > 24 * 60 * 60 * 1000;
}

export function marcarLimpezaFeita(): void {
  escrever(CHAVE_ULTIMA_LIMPEZA, String(Date.now()));
}

// --- Categorias recolhidas -------------------------------------------------

export function obterCategoriasRecolhidas(listId: string): string[] {
  const mapa = lerJson<Record<string, string[]>>(CHAVE_CATEGORIAS_RECOLHIDAS, {});
  const valor = mapa[listId];
  return Array.isArray(valor) ? valor : [];
}

export function definirCategoriasRecolhidas(listId: string, ids: string[]): void {
  const mapa = lerJson<Record<string, string[]>>(CHAVE_CATEGORIAS_RECOLHIDAS, {});
  mapa[listId] = ids;
  escrever(CHAVE_CATEGORIAS_RECOLHIDAS, JSON.stringify(mapa));
}

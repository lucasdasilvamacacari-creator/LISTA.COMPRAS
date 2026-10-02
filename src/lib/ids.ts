/**
 * Geração de ids.
 *
 * Duas regras valem ouro para o offline funcionar sem duplicar nada:
 *
 *  1. O id da LISTA é aleatório e longo (é a "chave" secreta compartilhada).
 *  2. O id do ITEM é DETERMINÍSTICO:
 *       - produto do catálogo → o próprio `catalogId`
 *       - item personalizado  → `p_` + slug do nome
 *     Assim, dois celulares offline que adicionam "Leite" escrevem no MESMO
 *     documento e, na reconexão, o Firestore apenas mescla os campos.
 */
import { slug } from './texto';

const ALFABETO = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Id de lista com 24 caracteres aleatórios criptográficos (≥ 20 pedidos). */
export function novoIdLista(tamanho = 24): string {
  const bytes = new Uint8Array(tamanho);
  crypto.getRandomValues(bytes);
  let saida = '';
  for (let i = 0; i < tamanho; i++) {
    saida += ALFABETO[(bytes[i] as number) % ALFABETO.length];
  }
  return saida;
}

/** Aceita apenas o formato que `novoIdLista` produz (evita lixo na URL). */
export function idListaValido(id: string): boolean {
  return /^[A-Za-z0-9]{20,40}$/.test(id);
}

/** Prefixo dos itens que não vêm do catálogo. */
export const PREFIXO_PERSONALIZADO = 'p_';

/** itemId para um produto do catálogo: o próprio catalogId. */
export function itemIdDoCatalogo(catalogId: string): string {
  return catalogId;
}

/** itemId para um item digitado pela família: determinístico pelo nome. */
export function itemIdPersonalizado(nome: string): string {
  const base = slug(nome);
  if (!base) throw new Error('Nome inválido para gerar o id do item.');
  return `${PREFIXO_PERSONALIZADO}${base}`;
}

/** Formato aceito pelas regras do Firestore para ids de item. */
export function itemIdValido(id: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,99}$/.test(id) || /^p_[a-z0-9][a-z0-9-]{0,79}$/.test(id);
}

/** Id de documento de histórico: espelha o itemId, para somar contagem. */
export function historicoIdDeItem(itemId: string): string {
  return itemId;
}

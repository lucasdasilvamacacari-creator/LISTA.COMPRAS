/** Leitura do id de lista a partir de um link colado ou de um código digitado. */
import { idListaValido } from './ids';

/**
 * Aceita "https://exemplo.com/?l=ABC", "exemplo.com/?l=ABC", "?l=ABC" e o
 * código solto "ABC". Devolve `null` quando não há id válido no texto — é isso
 * que impede o app de criar uma lista a partir de um link digitado errado.
 */
export function extrairIdLista(texto: string): string | null {
  const limpo = texto.trim();
  if (!limpo) return null;

  try {
    const url = new URL(limpo.includes('://') ? limpo : `https://${limpo}`);
    const parametro = url.searchParams.get('l');
    if (parametro && idListaValido(parametro)) return parametro;
  } catch {
    /* não era URL; tenta os outros formatos */
  }

  const comParametro = /[?&]?l=([A-Za-z0-9]{20,40})/.exec(limpo);
  if (comParametro?.[1] && idListaValido(comParametro[1])) return comParametro[1];

  if (idListaValido(limpo)) return limpo;

  return null;
}

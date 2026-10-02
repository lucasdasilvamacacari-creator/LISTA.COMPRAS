export { t } from './pt-BR';
export type { Textos } from './pt-BR';

import { t } from './pt-BR';
import type { CategoriaId } from '@/types';

/** Nome amigável de uma categoria, com fallback para "Outros". */
export function nomeCategoria(id: CategoriaId | string): string {
  return (t.categorias as Record<string, string>)[id] ?? t.categorias.outros;
}

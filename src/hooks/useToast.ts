/** Contexto e hook dos toasts. O provedor fica em `components/Toast.tsx`. */
import { createContext, useContext } from 'react';

export interface Toast {
  id: number;
  texto: string;
  /** Ação do botão "Desfazer". */
  desfazer?: () => void | Promise<void>;
  duracaoMs?: number;
  tom?: 'normal' | 'erro';
}

export interface ContextoToast {
  mostrar: (toast: Omit<Toast, 'id'>) => void;
  erro: (texto: string) => void;
}

export const ContextoToast = createContext<ContextoToast | null>(null);

export function useToast(): ContextoToast {
  const contexto = useContext(ContextoToast);
  if (!contexto) throw new Error('useToast precisa estar dentro de <ProvedorToast>.');
  return contexto;
}

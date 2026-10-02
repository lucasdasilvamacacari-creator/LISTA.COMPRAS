/**
 * Registro de notificações push — RECURSO OPCIONAL, DESLIGADO POR PADRÃO.
 *
 * Nada aqui roda enquanto `VITE_PUSH_ENABLED` não for `true` no .env.
 * Veja `functions/README.md`: push exige Cloud Functions, que exige o plano
 * Blaze (pago). O app funciona 100% sem isto.
 *
 * No iOS, só funciona com o app INSTALADO na Tela de Início e iOS 16.4+.
 */
import { doc, setDoc } from 'firebase/firestore';
import { obterDb, uidAtual } from './firebase';
import { chaveVapid, pushHabilitado } from './env';
import { estaInstalado, ehIos } from './dispositivo';

export type ResultadoPush =
  | 'desativado'
  | 'nao-suportado'
  | 'precisa-instalar-no-ios'
  | 'negado'
  | 'registrado'
  | 'erro';

/** `true` quando faz sentido oferecer push para este aparelho. */
export function pushDisponivel(): boolean {
  if (!pushHabilitado || !chaveVapid) return false;
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;
  // No iPhone o push de PWA só existe com o app instalado (iOS 16.4+).
  if (ehIos() && !estaInstalado()) return false;
  return true;
}

/**
 * Pede permissão e registra o token FCM deste aparelho na lista.
 * Idempotente: chamar de novo apenas reescreve o mesmo token.
 */
export async function registrarPush(listId: string): Promise<ResultadoPush> {
  if (!pushHabilitado || !chaveVapid) return 'desativado';
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return 'nao-suportado';
  if (ehIos() && !estaInstalado()) return 'precisa-instalar-no-ios';

  try {
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') return 'negado';

    const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
    if (!(await isSupported())) return 'nao-suportado';

    const registro = await navigator.serviceWorker.ready;
    const token = await getToken(getMessaging(), {
      vapidKey: chaveVapid,
      serviceWorkerRegistration: registro,
    });
    if (!token) return 'erro';

    // Mapa { token: uid }: permite a Cloud Function remover tokens inválidos
    // sem varrer a coleção inteira.
    await setDoc(
      doc(obterDb(), 'lists', listId, '_notificacoes', 'tokens'),
      { tokens: { [token]: uidAtual() ?? 'anon' } },
      { merge: true },
    );

    return 'registrado';
  } catch (erro) {
    console.warn('[push] não consegui registrar:', erro);
    return 'erro';
  }
}

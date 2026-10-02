/**
 * Leitura das variáveis de ambiente do Vite.
 *
 * As chaves "apiKey/projectId/..." do Firebase Web NÃO são secretas — elas vão
 * no bundle de qualquer jeito. A proteção real do app são as `firestore.rules`
 * e o App Check (veja o README).
 */

export interface ConfigFirebase {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function ler(nome: string): string {
  const valor = (import.meta.env as Record<string, string | undefined>)[nome];
  return typeof valor === 'string' ? valor.trim() : '';
}

export const configFirebase: ConfigFirebase = {
  apiKey: ler('VITE_FIREBASE_API_KEY'),
  authDomain: ler('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: ler('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: ler('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: ler('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: ler('VITE_FIREBASE_APP_ID'),
};

/** Chave do site reCAPTCHA v3 usada pelo App Check. Vazia = App Check desligado. */
export const chaveAppCheck = ler('VITE_APPCHECK_RECAPTCHA_KEY');

/** Token de depuração do App Check (use SÓ em desenvolvimento). */
export const tokenDebugAppCheck = ler('VITE_APPCHECK_DEBUG_TOKEN');

/** Host do emulador do Firestore, ex.: "127.0.0.1:8080". Vazio = produção. */
export const emuladorFirestore = ler('VITE_FIRESTORE_EMULATOR');

/** Host do emulador do Auth, ex.: "127.0.0.1:9099". */
export const emuladorAuth = ler('VITE_AUTH_EMULATOR');

/** Recurso opcional: notificações push via FCM (exige plano Blaze). */
export const pushHabilitado = ler('VITE_PUSH_ENABLED') === 'true';
export const chaveVapid = ler('VITE_FIREBASE_VAPID_KEY');

/** `true` quando o .env tem o mínimo necessário para falar com o Firebase. */
export const firebaseConfigurado =
  configFirebase.apiKey !== '' && configFirebase.projectId !== '' && configFirebase.appId !== '';

export const versaoApp = ler('VITE_APP_VERSION') || '1.0.0';

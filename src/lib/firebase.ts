/**
 * Inicialização do Firebase.
 *
 * Pontos importantes:
 *  - O cache persistente com `persistentMultipleTabManager` é o que faz o app
 *    funcionar offline e manter várias abas em sincronia. Se o navegador não
 *    suportar (Safari em modo privado, storage bloqueado, iframes), caímos para
 *    cache em memória: o app continua funcionando, só perde o offline entre
 *    sessões. Em nenhum cenário a tela quebra.
 *  - A autenticação é ANÔNIMA: não existe login. O usuário anônimo só serve
 *    para as regras do Firestore exigirem `request.auth != null`.
 *  - O App Check (reCAPTCHA v3) é opcional no código e obrigatório em produção;
 *    sem a chave no .env ele simplesmente não é ativado.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  connectAuthEmulator,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import {
  configFirebase,
  firebaseConfigurado,
  chaveAppCheck,
  tokenDebugAppCheck,
  emuladorFirestore,
  emuladorAuth,
} from './env';

export type ModoCache = 'persistente' | 'memoria';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let modoCache: ModoCache = 'memoria';
let promessaLogin: Promise<User> | null = null;

/** Erro lançado quando o .env não foi preenchido. A UI trata isso com uma tela própria. */
export class FirebaseNaoConfiguradoError extends Error {
  constructor() {
    super('Firebase não configurado: preencha o arquivo .env (veja o README).');
    this.name = 'FirebaseNaoConfiguradoError';
  }
}

function criarApp(): FirebaseApp {
  if (!firebaseConfigurado) throw new FirebaseNaoConfiguradoError();
  if (app) return app;
  app = initializeApp(configFirebase);
  ativarAppCheck(app);
  return app;
}

/**
 * App Check protege o backend contra uso do seu projeto por terceiros.
 * Carregado de forma dinâmica para não pesar o bundle de quem não usa.
 */
function ativarAppCheck(instancia: FirebaseApp): void {
  if (!chaveAppCheck) return;
  void (async () => {
    try {
      const { initializeAppCheck, ReCaptchaV3Provider } = await import('firebase/app-check');
      if (tokenDebugAppCheck) {
        // Só em desenvolvimento: libera o App Check sem reCAPTCHA real.
        (globalThis as Record<string, unknown>)['FIREBASE_APPCHECK_DEBUG_TOKEN'] =
          tokenDebugAppCheck;
      }
      initializeAppCheck(instancia, {
        provider: new ReCaptchaV3Provider(chaveAppCheck),
        isTokenAutoRefreshEnabled: true,
      });
    } catch (erro) {
      // App Check indisponível não pode derrubar o app.
      console.warn('[firebase] App Check não foi ativado:', erro);
    }
  })();
}

/** Instância do Firestore, já com cache offline configurado. */
export function obterDb(): Firestore {
  if (db) return db;
  const instancia = criarApp();

  try {
    db = initializeFirestore(instancia, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
    modoCache = 'persistente';
  } catch (erro) {
    // Navegador sem IndexedDB utilizável (modo privado, storage bloqueado…).
    console.warn('[firebase] Cache persistente indisponível, usando cache em memória.', erro);
    db = initializeFirestore(instancia, { localCache: memoryLocalCache() });
    modoCache = 'memoria';
  }

  if (emuladorFirestore) {
    const [host, porta] = emuladorFirestore.split(':');
    connectFirestoreEmulator(db, host ?? '127.0.0.1', Number(porta ?? 8080));
  }

  return db;
}

/** 'persistente' = funciona offline entre sessões; 'memoria' = só nesta aba. */
export function obterModoCache(): ModoCache {
  return modoCache;
}

export function obterAuth(): Auth {
  if (auth) return auth;
  auth = getAuth(criarApp());
  if (emuladorAuth) {
    connectAuthEmulator(auth, `http://${emuladorAuth}`, { disableWarnings: true });
  }
  return auth;
}

/**
 * Garante um usuário anônimo. É idempotente e seguro de chamar várias vezes.
 *
 * Offline: se já existe uma sessão anônima no armazenamento local, o Firebase a
 * restaura sem rede e esta promessa resolve normalmente. Só a PRIMEIRA entrada
 * de todas exige internet — exatamente como está documentado no README.
 */
export function garantirLogin(): Promise<User> {
  if (promessaLogin) return promessaLogin;

  const instancia = obterAuth();
  promessaLogin = new Promise<User>((resolve, reject) => {
    let resolvido = false;
    const parar = onAuthStateChanged(
      instancia,
      (usuario) => {
        if (usuario && !resolvido) {
          resolvido = true;
          parar();
          resolve(usuario);
        } else if (!usuario) {
          signInAnonymously(instancia).catch((erro: unknown) => {
            if (!resolvido) {
              resolvido = true;
              parar();
              promessaLogin = null;
              reject(erro instanceof Error ? erro : new Error(String(erro)));
            }
          });
        }
      },
      (erro) => {
        if (!resolvido) {
          resolvido = true;
          promessaLogin = null;
          reject(erro);
        }
      },
    );
  });

  return promessaLogin;
}

/** Uid do usuário anônimo atual, se já estiver autenticado. */
export function uidAtual(): string | null {
  return auth?.currentUser?.uid ?? null;
}

/**
 * Pede ao navegador para não apagar os dados locais sob pressão de espaço.
 * Em alguns navegadores é concedido automaticamente; em outros depende de o
 * app estar instalado. Nunca falha de forma visível.
 */
export async function pedirArmazenamentoPersistente(): Promise<boolean> {
  try {
    if (!('storage' in navigator) || !navigator.storage.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

/** Usado apenas pelos testes, para começar de um estado limpo. */
export function _resetarParaTestes(): void {
  app = null;
  db = null;
  auth = null;
  promessaLogin = null;
  modoCache = 'memoria';
}

/**
 * Testes das regras do Firestore, no Firebase Emulator Suite.
 *
 * Como rodar:
 *   Terminal 1:  npm run emulators
 *   Terminal 2:  npm run test:rules
 *
 * O teste mais importante deste arquivo é o primeiro: LISTAR a coleção raiz
 * `lists` tem de FALHAR. Se essa regra cair, o id aleatório da lista deixa de
 * proteger qualquer coisa — qualquer pessoa autenticada anonimamente poderia
 * enumerar e ler as listas de todas as famílias.
 */
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';

const PROJETO = 'lista-mercado-regras';
const LISTA = 'AbCdEfGhIjKlMnOpQrStUvWx'; // 24 caracteres, formato válido
const OUTRA_LISTA = 'ZyXwVuTsRqPoNmLkJiHgFeDc';

let ambiente: RulesTestEnvironment;

/** Cliente autenticado anonimamente (é o único tipo de usuário do app). */
function anonimo(uid = 'anon-1'): Firestore {
  return ambiente.authenticatedContext(uid).firestore() as unknown as Firestore;
}

function deslogado(): Firestore {
  return ambiente.unauthenticatedContext().firestore() as unknown as Firestore;
}

const ITEM_VALIDO = {
  catalogId: 'leite-integral',
  name: 'Leite integral',
  category: 'frios-laticinios',
  qty: 2,
  unit: 'L',
  note: 'sem lactose',
  checked: false,
  checkedBy: null,
  addedBy: 'Maria',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  clientUpdatedAt: Date.now(),
  deleted: false,
};

const LISTA_VALIDA = {
  name: 'Mercado',
  createdAt: serverTimestamp(),
  aisleOrder: ['hortifruti', 'acougue', 'mercearia'],
  schemaVersion: 1,
};

beforeAll(async () => {
  ambiente = await initializeTestEnvironment({
    projectId: PROJETO,
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await ambiente?.cleanup();
});

beforeEach(async () => {
  await ambiente.clearFirestore();
  // Semeia duas listas, ignorando as regras.
  await ambiente.withSecurityRulesDisabled(async (contexto) => {
    const db = contexto.firestore() as unknown as Firestore;
    await setDoc(doc(db, 'lists', LISTA), LISTA_VALIDA);
    await setDoc(doc(db, 'lists', OUTRA_LISTA), { ...LISTA_VALIDA, name: 'Feira' });
    await setDoc(doc(db, 'lists', LISTA, 'items', 'leite-integral'), ITEM_VALIDO);
  });
});

// ===========================================================================
// A regra mais importante
// ===========================================================================

describe('enumerar listas é PROIBIDO', () => {
  it('listar a coleção raiz `lists` falha, mesmo autenticado', async () => {
    // Sem isto, o id aleatório não protegeria nada.
    await assertFails(getDocs(collection(anonimo(), 'lists')));
  });

  it('listar a raiz falha também para quem não está autenticado', async () => {
    await assertFails(getDocs(collection(deslogado(), 'lists')));
  });
});

// ===========================================================================
// Autenticação
// ===========================================================================

describe('exige usuário autenticado (anônimo)', () => {
  it('sem login não lê a lista', async () => {
    await assertFails(getDoc(doc(deslogado(), 'lists', LISTA)));
  });

  it('sem login não escreve item', async () => {
    await assertFails(
      setDoc(doc(deslogado(), 'lists', LISTA, 'items', 'arroz-branco'), ITEM_VALIDO),
    );
  });

  it('com login anônimo lê a lista (quem tem o id, entra)', async () => {
    await assertSucceeds(getDoc(doc(anonimo(), 'lists', LISTA)));
  });

  it('qualquer usuário anônimo com o id acessa — é o modelo do app', async () => {
    // Não existe "dono": o link é a chave. Dois uids diferentes com o mesmo id
    // da lista são a mesma família compartilhando o link.
    await assertSucceeds(getDoc(doc(anonimo('anon-1'), 'lists', LISTA)));
    await assertSucceeds(getDoc(doc(anonimo('anon-2'), 'lists', LISTA)));
  });
});

// ===========================================================================
// Formato do id de lista
// ===========================================================================

describe('formato do id da lista', () => {
  it('recusa id curto', async () => {
    await assertFails(setDoc(doc(anonimo(), 'lists', 'curto'), LISTA_VALIDA));
  });

  it('recusa id com caracteres fora do alfabeto', async () => {
    await assertFails(setDoc(doc(anonimo(), 'lists', 'id-com-hifens-aqui-oh'), LISTA_VALIDA));
  });

  it('aceita id no formato gerado pelo app', async () => {
    await assertSucceeds(
      setDoc(doc(anonimo(), 'lists', 'NovaListaComVinteECincoXy'), LISTA_VALIDA),
    );
  });
});

// ===========================================================================
// Documento da lista
// ===========================================================================

describe('documento da lista', () => {
  it('cria com os campos previstos', async () => {
    await assertSucceeds(
      setDoc(doc(anonimo(), 'lists', 'OutraListaValidaAquiXyz1'), LISTA_VALIDA),
    );
  });

  it('recusa campo desconhecido na criação', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', 'OutraListaValidaAquiXyz2'), {
        ...LISTA_VALIDA,
        campoEstranho: 'xxx',
      }),
    );
  });

  it('recusa nome vazio e nome gigante', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', 'OutraListaValidaAquiXyz3'), { ...LISTA_VALIDA, name: '' }),
    );
    await assertFails(
      setDoc(doc(anonimo(), 'lists', 'OutraListaValidaAquiXyz4'), {
        ...LISTA_VALIDA,
        name: 'a'.repeat(61),
      }),
    );
  });

  it('permite renomear e reordenar corredores', async () => {
    await assertSucceeds(
      setDoc(doc(anonimo(), 'lists', LISTA), { name: 'Feira de sábado' }, { merge: true }),
    );
    await assertSucceeds(
      setDoc(doc(anonimo(), 'lists', LISTA), { aisleOrder: ['mercearia', 'hortifruti'] }, { merge: true }),
    );
  });

  it('recusa alterar createdAt', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA), { createdAt: serverTimestamp() }, { merge: true }),
    );
  });

  it('não permite apagar a lista', async () => {
    await assertFails(deleteDoc(doc(anonimo(), 'lists', LISTA)));
  });
});

// ===========================================================================
// Itens
// ===========================================================================

describe('itens — leitura e escrita', () => {
  it('lê e lista os itens de uma lista conhecida', async () => {
    const db = anonimo();
    await assertSucceeds(getDocs(collection(db, 'lists', LISTA, 'items')));
    await assertSucceeds(getDoc(doc(db, 'lists', LISTA, 'items', 'leite-integral')));
  });

  it('cria item válido', async () => {
    await assertSucceeds(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'arroz-branco'), ITEM_VALIDO),
    );
  });

  it('aceita increment na quantidade (é o que o app faz)', async () => {
    await assertSucceeds(
      setDoc(
        doc(anonimo(), 'lists', LISTA, 'items', 'leite-integral'),
        { qty: increment(1), updatedAt: serverTimestamp(), clientUpdatedAt: Date.now() },
        { merge: true },
      ),
    );
  });

  it('permite o soft delete', async () => {
    await assertSucceeds(
      setDoc(
        doc(anonimo(), 'lists', LISTA, 'items', 'leite-integral'),
        { deleted: true, qty: 0, updatedAt: serverTimestamp(), clientUpdatedAt: Date.now() },
        { merge: true },
      ),
    );
  });

  it('permite o delete de verdade (limpeza dos apagados após 30 dias)', async () => {
    await assertSucceeds(deleteDoc(doc(anonimo(), 'lists', LISTA, 'items', 'leite-integral')));
  });
});

describe('itens — validação do formato do itemId', () => {
  it('aceita slug do catálogo e prefixo p_', async () => {
    const db = anonimo();
    await assertSucceeds(setDoc(doc(db, 'lists', LISTA, 'items', 'arroz-integral'), ITEM_VALIDO));
    await assertSucceeds(setDoc(doc(db, 'lists', LISTA, 'items', 'p_suco-de-caju'), ITEM_VALIDO));
  });

  it('recusa id com maiúsculas, underscore ou começando com hífen', async () => {
    const db = anonimo();
    await assertFails(setDoc(doc(db, 'lists', LISTA, 'items', 'Arroz-Branco'), ITEM_VALIDO));
    await assertFails(setDoc(doc(db, 'lists', LISTA, 'items', 'arroz_branco'), ITEM_VALIDO));
    await assertFails(setDoc(doc(db, 'lists', LISTA, 'items', '-arroz'), ITEM_VALIDO));
  });

  it('recusa id gigante', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'a'.repeat(120)), ITEM_VALIDO),
    );
  });
});

describe('itens — validação de tipos e tamanhos', () => {
  it('recusa nome acima de 80 caracteres', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'item-grande'), {
        ...ITEM_VALIDO,
        name: 'a'.repeat(81),
      }),
    );
  });

  it('recusa observação acima de 200 caracteres', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'item-obs'), {
        ...ITEM_VALIDO,
        note: 'a'.repeat(201),
      }),
    );
  });

  it('recusa quantidade negativa e acima de 999', async () => {
    const db = anonimo();
    await assertFails(
      setDoc(doc(db, 'lists', LISTA, 'items', 'item-neg'), { ...ITEM_VALIDO, qty: -1 }),
    );
    await assertFails(
      setDoc(doc(db, 'lists', LISTA, 'items', 'item-max'), { ...ITEM_VALIDO, qty: 1000 }),
    );
  });

  it('aceita a faixa válida de quantidade', async () => {
    const db = anonimo();
    await assertSucceeds(
      setDoc(doc(db, 'lists', LISTA, 'items', 'item-zero'), { ...ITEM_VALIDO, qty: 0 }),
    );
    await assertSucceeds(
      setDoc(doc(db, 'lists', LISTA, 'items', 'item-999'), { ...ITEM_VALIDO, qty: 999 }),
    );
  });

  it('recusa categoria inválida', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'item-cat'), {
        ...ITEM_VALIDO,
        category: 'categoria-inventada',
      }),
    );
  });

  it('recusa unidade inválida', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'item-un'), {
        ...ITEM_VALIDO,
        unit: 'toneladas',
      }),
    );
  });

  it('recusa campo desconhecido', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'item-extra'), {
        ...ITEM_VALIDO,
        scriptMalicioso: '<script>',
      }),
    );
  });

  it('recusa tipo errado em checked', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'item-bool'), {
        ...ITEM_VALIDO,
        checked: 'sim',
      }),
    );
  });

  it('recusa criar item sem nome', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'items', 'item-sem-nome'), {
        ...ITEM_VALIDO,
        name: '',
      }),
    );
  });
});

// ===========================================================================
// Produtos personalizados e histórico
// ===========================================================================

describe('produtos personalizados', () => {
  const PRODUTO = {
    nome: 'Tempero da vovó',
    categoria: 'mercearia',
    unidadePadrao: 'un',
    sinonimos: ['tempero especial'],
    criadoPor: 'Maria',
    createdAt: serverTimestamp(),
  };

  it('cria e lê', async () => {
    const db = anonimo();
    await assertSucceeds(
      setDoc(doc(db, 'lists', LISTA, 'customProducts', 'tempero-da-vovo'), PRODUTO),
    );
    await assertSucceeds(getDocs(collection(db, 'lists', LISTA, 'customProducts')));
  });

  it('recusa categoria e unidade inválidas', async () => {
    const db = anonimo();
    await assertFails(
      setDoc(doc(db, 'lists', LISTA, 'customProducts', 'teste-1'), {
        ...PRODUTO,
        categoria: 'inexistente',
      }),
    );
    await assertFails(
      setDoc(doc(db, 'lists', LISTA, 'customProducts', 'teste-2'), {
        ...PRODUTO,
        unidadePadrao: 'arrobas',
      }),
    );
  });

  it('recusa id fora do formato slug', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'customProducts', 'Tempero_Da_Vovo'), PRODUTO),
    );
  });
});

describe('histórico', () => {
  const HISTORICO = {
    name: 'Leite integral',
    category: 'frios-laticinios',
    catalogId: 'leite-integral',
    unit: 'L',
    count: 1,
    lastAt: serverTimestamp(),
    clientLastAt: Date.now(),
  };

  it('cria, lê e soma com increment', async () => {
    const db = anonimo();
    await assertSucceeds(
      setDoc(doc(db, 'lists', LISTA, 'history', 'leite-integral'), HISTORICO),
    );
    await assertSucceeds(
      setDoc(
        doc(db, 'lists', LISTA, 'history', 'leite-integral'),
        { count: increment(1), clientLastAt: Date.now() },
        { merge: true },
      ),
    );
    await assertSucceeds(getDocs(collection(db, 'lists', LISTA, 'history')));
  });

  it('recusa campo desconhecido', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'history', 'leite-integral'), {
        ...HISTORICO,
        extra: 1,
      }),
    );
  });
});

// ===========================================================================
// Nada fora do modelo previsto
// ===========================================================================

describe('fora do modelo, tudo fechado', () => {
  it('subcoleção não prevista é negada', async () => {
    await assertFails(
      setDoc(doc(anonimo(), 'lists', LISTA, 'coisaEstranha', 'x'), { a: 1 }),
    );
  });

  it('coleção de topo não prevista é negada', async () => {
    await assertFails(setDoc(doc(anonimo(), 'outraColecao', 'x'), { a: 1 }));
    await assertFails(getDocs(collection(anonimo(), 'outraColecao')));
  });
});

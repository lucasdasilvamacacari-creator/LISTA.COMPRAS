/**
 * Notificações push — RECURSO OPCIONAL, DESATIVADO POR PADRÃO.
 *
 * Leia functions/README.md antes de publicar: isto exige Cloud Functions, que
 * exige o plano Blaze (pago). O aplicativo funciona 100% sem nada daqui.
 *
 * Como o agrupamento funciona:
 *   1. `avisarNovoItem` dispara a cada item criado/revivido e apenas ACUMULA o
 *      que mudou em `lists/{listId}/_notificacoes/pendente`. Não envia nada.
 *   2. `enviarResumos` roda a cada 5 minutos, varre o que está pendente e
 *      envia UMA notificação por lista, somando as mudanças do período.
 *
 * Sem esse acúmulo, uma compra grande viraria vinte notificações seguidas.
 */
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { setGlobalOptions } from 'firebase-functions/v2';
import { initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

initializeApp();

// São Paulo mantém a latência baixa e o custo previsível para uso no Brasil.
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 5 });

const db = getFirestore();

/** No máximo uma notificação a cada 5 minutos por lista. */
const INTERVALO_MINUTOS = 5;

interface Pendencia {
  nomes: string[];
  autores: string[];
  atualizadoEm: FirebaseFirestore.Timestamp | FieldValue;
}

/**
 * Acumula as mudanças. Dispara para QUALQUER escrita em items, mas só registra
 * quando o item passa a existir de fato (criado, ou revivido de um soft delete).
 */
export const avisarNovoItem = onDocumentWritten(
  'lists/{listId}/items/{itemId}',
  async (evento) => {
    const antes = evento.data?.before.data();
    const depois = evento.data?.after.data();

    // Apagado de vez: nada a avisar.
    if (!depois) return;

    const estavaVisivel = !!antes && antes['deleted'] !== true;
    const estaVisivel = depois['deleted'] !== true;

    // Só interessa a transição "não estava na lista" → "está na lista".
    if (estavaVisivel || !estaVisivel) return;

    const listId = evento.params['listId'] as string;
    const nome = typeof depois['name'] === 'string' ? (depois['name'] as string) : 'um item';
    const autor = typeof depois['addedBy'] === 'string' ? (depois['addedBy'] as string) : '';

    await db
      .doc(`lists/${listId}/_notificacoes/pendente`)
      .set(
        {
          nomes: FieldValue.arrayUnion(nome),
          ...(autor ? { autores: FieldValue.arrayUnion(autor) } : {}),
          atualizadoEm: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
  },
);

/** Monta o texto da notificação a partir do que foi acumulado. */
function montarMensagem(nomes: string[], autores: string[]): { titulo: string; corpo: string } {
  const quem = autores.length === 1 ? (autores[0] as string) : 'Alguém';
  const lista = nomes.slice(0, 3).join(', ');
  const resto = nomes.length - 3;

  if (nomes.length === 1) {
    return { titulo: 'Lista de Mercado', corpo: `${quem} adicionou ${nomes[0]} à lista` };
  }

  const sufixo = resto > 0 ? ` e mais ${resto}` : '';
  return {
    titulo: 'Lista de Mercado',
    corpo: `${quem} adicionou ${lista}${sufixo} à lista`,
  };
}

/**
 * Envia um resumo por lista, a cada 5 minutos.
 *
 * Os tokens ficam em `lists/{listId}/_notificacoes/tokens`, com o campo
 * `tokens` sendo um mapa { token: uid } — assim conseguimos remover tokens
 * inválidos sem precisar varrer nada.
 */
export const enviarResumos = onSchedule(
  { schedule: `every ${INTERVALO_MINUTOS} minutes`, timeZone: 'America/Sao_Paulo' },
  async () => {
    const pendentes = await db.collectionGroup('_notificacoes').get();

    for (const documento of pendentes.docs) {
      if (documento.id !== 'pendente') continue;

      const dados = documento.data() as Partial<Pendencia>;
      const nomes = Array.isArray(dados.nomes) ? dados.nomes : [];
      if (nomes.length === 0) continue;

      // lists/{listId}/_notificacoes/pendente → o id da lista é o 2º segmento.
      const listId = documento.ref.path.split('/')[1];
      if (!listId) continue;

      const docTokens = await db.doc(`lists/${listId}/_notificacoes/tokens`).get();
      const mapa = (docTokens.data()?.['tokens'] ?? {}) as Record<string, string>;
      const tokens = Object.keys(mapa);

      // Limpa o pendente antes de enviar: se o envio falhar, o pior caso é
      // perder um aviso, nunca notificar a mesma coisa para sempre.
      await documento.ref.delete();

      if (tokens.length === 0) continue;

      const { titulo, corpo } = montarMensagem(nomes, Array.isArray(dados.autores) ? dados.autores : []);

      const resposta = await getMessaging().sendEachForMulticast({
        tokens,
        notification: { title: titulo, body: corpo },
        webpush: {
          notification: {
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: `lista-${listId}`, // agrupa na bandeja do sistema
            renotify: false,
          },
          fcmOptions: { link: `/?l=${listId}` },
        },
      });

      // Remove tokens que o FCM recusou (app desinstalado, token expirado).
      const invalidos: string[] = [];
      resposta.responses.forEach((item, indice) => {
        const codigo = item.error?.code;
        if (
          codigo === 'messaging/registration-token-not-registered' ||
          codigo === 'messaging/invalid-registration-token'
        ) {
          const token = tokens[indice];
          if (token) invalidos.push(token);
        }
      });

      if (invalidos.length > 0) {
        const remocoes: Record<string, FieldValue> = {};
        for (const token of invalidos) remocoes[`tokens.${token}`] = FieldValue.delete();
        await db.doc(`lists/${listId}/_notificacoes/tokens`).update(remocoes);
      }
    }
  },
);

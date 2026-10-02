/*
 * Service worker do Firebase Cloud Messaging — RECURSO OPCIONAL.
 *
 * Este arquivo só faz algo quando as notificações push estão ativadas
 * (VITE_PUSH_ENABLED=true + plano Blaze + Cloud Functions publicadas).
 * Veja functions/README.md.
 *
 * Ele é separado do service worker do PWA (gerado pelo Workbox) de propósito:
 * o FCM exige um arquivo com este nome exato na raiz do site.
 *
 * ATENÇÃO: preencha a configuração abaixo com os dados do SEU projeto antes
 * de ativar o push. Este arquivo é servido estaticamente e NÃO passa pelo
 * Vite, então não dá para usar variáveis de ambiente aqui.
 */
/* global importScripts, firebase */

const CONFIGURADO = false; // ← mude para true depois de preencher abaixo

if (CONFIGURADO) {
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: 'COLE_AQUI',
    authDomain: 'COLE_AQUI',
    projectId: 'COLE_AQUI',
    storageBucket: 'COLE_AQUI',
    messagingSenderId: 'COLE_AQUI',
    appId: 'COLE_AQUI',
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const titulo = payload.notification?.title ?? 'Lista de Mercado';
    self.registration.showNotification(titulo, {
      body: payload.notification?.body ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      // `tag` igual faz o sistema SUBSTITUIR o aviso anterior em vez de
      // empilhar vários — é parte do agrupamento.
      tag: payload.notification?.tag ?? 'lista-mercado',
      data: { url: payload.fcmOptions?.link ?? '/' },
    });
  });

  // Tocar na notificação abre a lista certa (ou foca a aba já aberta).
  self.addEventListener('notificationclick', (evento) => {
    evento.notification.close();
    const destino = evento.notification.data?.url ?? '/';
    evento.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
        for (const janela of janelas) {
          if ('focus' in janela) return janela.focus();
        }
        return self.clients.openWindow(destino);
      }),
    );
  });
}

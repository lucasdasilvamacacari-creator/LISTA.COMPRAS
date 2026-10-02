# Notificações push (OPCIONAL — exige o plano Blaze)

Esta pasta é **completamente opcional** e vem **desativada por padrão**.
O aplicativo funciona 100% sem nada daqui, no plano gratuito (Spark) do Firebase.

---

## ⚠️ Leia antes de ativar: isto custa dinheiro

Enviar push exige **Cloud Functions**, que por sua vez exige o **plano Blaze
(pago, por uso)**. Não existe caminho para push no plano gratuito.

O Blaze tem uma cota gratuita generosa e, para uma lista de família, o custo
real tende a ficar em **zero ou poucos centavos por mês** — mas é um plano
com cartão de crédito cadastrado, e a responsabilidade pela conta é sua.
Recomendamos definir um **alerta de orçamento** no Console do Google Cloud
antes de ativar qualquer coisa.

**Se você não quiser pagar, não ative.** O app continua perfeito sem push:
a sincronização em tempo real já funciona com o aplicativo aberto.

## ⚠️ Limitação do iOS

No iPhone e no iPad, notificações push de PWA só funcionam quando:

- o aparelho está no **iOS 16.4 ou mais novo**; **e**
- o app foi **instalado na Tela de Início** (não basta abrir no Safari); **e**
- a pessoa autorizou as notificações **depois** de instalar.

No Android funciona tanto instalado quanto no navegador.

---

## O que este código faz

Quando alguém adiciona um item, uma Cloud Function dispara uma notificação
para os outros aparelhos da mesma lista: *"Maria adicionou Leite à lista"*.

As notificações são **agrupadas**: no máximo **1 aviso a cada 5 minutos por
lista**, somando o que mudou no período. Sem isso, uma compra grande viraria
vinte notificações seguidas.

## Como ativar (passo a passo)

1. **Mude o projeto para o plano Blaze** no Console do Firebase
   (Configurações → Uso e faturamento → Modificar plano).
2. **Defina um alerta de orçamento** no Console do Google Cloud
   (Faturamento → Orçamentos e alertas). Sugestão: R$ 5,00/mês.
3. **Gere a chave VAPID**: Console → Configurações do projeto →
   Cloud Messaging → Web Push certificates → Generate key pair.
4. No `.env` da raiz do projeto, preencha:
   ```
   VITE_PUSH_ENABLED=true
   VITE_FIREBASE_VAPID_KEY=<a chave VAPID gerada>
   ```
5. Instale e publique as functions:
   ```bash
   cd functions
   npm install
   npm run build
   cd ..
   firebase deploy --only functions
   ```
6. Publique o app de novo (`npm run build && firebase deploy --only hosting`),
   para o `firebase-messaging-sw.js` ir junto.

## Como desativar de novo

Coloque `VITE_PUSH_ENABLED=false` no `.env`, publique o app, e remova as
functions:

```bash
firebase functions:delete avisarNovoItem enviarResumos
```

Voltar o projeto para o plano Spark também desliga tudo.

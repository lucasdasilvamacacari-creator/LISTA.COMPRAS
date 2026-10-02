import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  // Margem larga: os testes falam com o emulador do Firestore, que num
  // container compartilhado pode ficar lento.
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  // Uma tentativa extra: os testes falam com o Firestore Emulator, e em
  // container a conexão com ele cai de vez em quando
  // ("Could not reach Cloud Firestore backend"). Isso é do ambiente, não do
  // app — e uma falha REAL continua falhando nas duas tentativas.
  retries: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // PLAYWRIGHT_CHROMIUM_PATH permite usar um Chromium já instalado na
        // máquina (útil em CI/containers onde a versão baixada pelo Playwright
        // não casa com a do pacote). Sem a variável, usa o padrão.
        ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
          : {}),
      },
    },
  ],
  // O build já é feito pelo script `pretest:e2e` (com --mode e2e, que lê o
  // .env.e2e e aponta para o emulador). Aqui só servimos o dist/.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npm run preview -- --port 4173 --host 127.0.0.1',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});

import { defineConfig } from 'vitest/config';

// Testes das regras do Firestore: precisam do emulador rodando.
//   npm run emulators   (em outro terminal)
//   npm run test:rules
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 20000,
    fileParallelism: false,
  },
});

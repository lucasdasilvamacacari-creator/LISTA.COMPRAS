import '@testing-library/jest-dom/vitest';

// `crypto.getRandomValues` existe no jsdom moderno, mas garantimos o fallback
// para o gerador de ids de lista não quebrar o ambiente de teste.
if (!globalThis.crypto?.getRandomValues) {
  const { webcrypto } = await import('node:crypto');
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

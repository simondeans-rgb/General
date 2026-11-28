import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 180_000,   // each file rebuilds the database from 67+ migrations; slow when the machine is busy
    pool: 'forks',              // one connection per file, no cross-test bleed
    poolOptions: { forks: { singleFork: true } },
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/test-setup.ts'
      ]
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000,
    pool: 'forks'
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
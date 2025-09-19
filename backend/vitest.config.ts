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
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
    env: {
      MONGOMS_DOWNLOAD_DIR: process.env.HOME + '/.mongodb-memory-server-binaries',
      MONGOMS_VERSION: '8.0.1'
    }
  },
  resolve: {
    alias: {
      '@': './src'
    }
  }
});
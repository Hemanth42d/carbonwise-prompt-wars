import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      /* Cover only pure business-logic files — UI components require browser rendering */
      include: [
        'src/shared/utils/**/*.ts',
        'src/shared/constants/**/*.ts',
        'src/services/**/*.ts',
        'src/app/store.ts',
      ],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/__tests__/**',
      ],
      thresholds: {
        statements: 95,
        branches: 75,
        functions: 95,
        lines: 95,
      },
    },
  },
});

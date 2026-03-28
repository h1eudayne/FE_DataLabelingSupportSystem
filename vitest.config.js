import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: [
      'src/services/**/*.test.js',
      'src/store/**/*.test.{js,jsx}',
      'src/page/**/*.test.{js,jsx}',
      'src/components/**/*.test.{js,jsx}',
      'src/hooks/**/*.test.js',
    ],
    exclude: [
      'node_modules',
      'dist',
    ],
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

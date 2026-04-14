import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import path from 'path';

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../../shared'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
});
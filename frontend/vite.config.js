import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  esbuild: { jsx: 'automatic' },
  plugins: [tailwindcss()],
  server: {
    fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
});

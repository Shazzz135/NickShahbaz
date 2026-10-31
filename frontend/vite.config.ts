import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    // The lazy-loaded Three.js chunk is expected to be large; real limits are
    // enforced by scripts/check-bundle-size.mjs (gzipped) in CI.
    chunkSizeWarningLimit: 1200,
  },
});

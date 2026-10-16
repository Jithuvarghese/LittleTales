/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { studioPlugin } from './scripts/studio/plugin';
import { fileURLToPath, URL } from 'node:url';

// Normalise the Windows drive letter so one module never loads under two paths.
const src = fileURLToPath(new URL('./src', import.meta.url)).replace(/^[a-z]:/, (d) =>
  d.toUpperCase(),
);

export default defineConfig({
  plugins: [
    react(),
    studioPlugin(),
    // Service worker for caching only (no install prompt): app shell and every
    // story chunk are precached; audio and images are cached as they are used.
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/audio/') || url.pathname.startsWith('/images/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'lt-media',
              expiration: { maxEntries: 2000 },
              rangeRequests: true,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': src },
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/motion-')) return 'motion';
          if (id.includes('node_modules/howler')) return 'audio';
          if (id.includes('node_modules/zod')) return 'zod';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'threads',
    maxWorkers: 2,
    isolate: false,
    testTimeout: 30000,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
  },
});

/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Normalise the Windows drive letter so one module never loads under two paths.
const src = fileURLToPath(new URL('./src', import.meta.url)).replace(/^[a-z]:/, (d) =>
  d.toUpperCase(),
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': src },
    dedupe: ['react', 'react-dom'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    pool: 'threads',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
  },
});

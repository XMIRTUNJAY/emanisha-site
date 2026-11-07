import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Vite configuration for Dhyaana embedded at /dhyaana/
export default defineConfig({
  base: '/dhyaana/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: '../../public/dhyaana',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})

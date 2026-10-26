import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
import { pwaOptions } from './src/pwa/config.js'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': { target: 'http://45.66.153.148:30024', changeOrigin: true },
      '/socket.io': { target: 'http://45.66.153.148:30024', changeOrigin: true, ws: true },
    },
  },
})

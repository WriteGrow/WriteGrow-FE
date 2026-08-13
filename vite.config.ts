import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: 'WriteGrow',
        short_name: 'WriteGrow',
        description: '초등 AI 문해력 코치',
        lang: 'ko',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2b7f6a',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // MSW's own service worker owns /mockServiceWorker.js in dev;
        // Workbox precaching stays scoped to build assets.
        globPatterns: ['**/*.{js,css,html,png,svg}'],
      },
      // Disabled in dev: MSW's own service worker (mockServiceWorker.js)
      // registers at the same '/' scope and would fight Workbox's SW for
      // control of the page. Verify installability via `npm run build && npm run preview`.
      devOptions: {
        enabled: false,
      },
    }),
  ],
})

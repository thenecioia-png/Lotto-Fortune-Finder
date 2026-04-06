import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg'],
      manifest: {
        name: 'Aurum Números',
        short_name: 'Aurum',
        description: 'Tu portal de numerología y lotería dominicana',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        icons: [
          {
            src: 'icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Números de hoy',
            url: '/',
            description: 'Ver números de la suerte del día',
          },
          {
            name: 'Interpretar sueño',
            url: '/suenos',
            description: 'Descifrar números de tu sueño',
          },
          {
            name: 'Sorteos',
            url: '/sorteos',
            description: 'Horarios de loterías',
          },
        ],
        categories: ['entertainment', 'lifestyle'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/lottery/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'lottery-cache',
              expiration: { maxAgeSeconds: 60 * 60 }, // 1 hora
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});

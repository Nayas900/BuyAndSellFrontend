import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL;

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/icon-512.png', 'icons/icon-192.png', 'icons/apple-touch-icon.png'],
        manifest: {
          name: 'KKR Buy & Sell',
          short_name: 'KKR',
          description: 'Kurukshetra\'s trusted peer-to-peer marketplace',
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#2563eb',
          orientation: 'portrait',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: apiUrl
            ? [
                {
                  urlPattern: new RegExp(`^${escapeRegExp(apiUrl)}/.*`, 'i'),
                  handler: 'NetworkFirst',
                  options: {
                    cacheName: 'api-cache',
                    networkTimeoutSeconds: 10,
                  },
                },
              ]
            : [],
        },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
  };
});

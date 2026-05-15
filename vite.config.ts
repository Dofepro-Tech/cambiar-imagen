import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

import { cloudflare } from "@cloudflare/vite-plugin";

function normalizeBasePath(value: string | undefined) {
  if (!value || value === '/') {
    return '/';
  }

  const trimmed = value.trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
  const base = normalizeBasePath(
    env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS === 'true' && repositoryName ? repositoryName : '/'),
  );

  return {
    base,
    plugins: [react(), tailwindcss(), VitePWA({
      injectRegister: false,
      registerType: 'prompt',
      manifest: false,
      includeAssets: [
        'LogoPrincipal.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'icon-192.png',
        'icon-512.png',
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: ({ request, url }) => request.destination === 'document' && url.origin === self.location.origin,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'app-pages',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
            },
          },
          {
            urlPattern: ({ request, url }) => ['script', 'style', 'worker'].includes(request.destination) && url.origin === self.location.origin,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: ({ request, url }) => request.destination === 'image' && url.origin === self.location.origin,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'app-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
      },
    }), cloudflare()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
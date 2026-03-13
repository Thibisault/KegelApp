import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const githubPagesBase = '/KegelApp/';

export default defineConfig(({ command }) => {
  const base = command === 'serve' ? '/' : githubPagesBase;

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
        manifest: {
          id: base,
          name: 'Kegel App',
          short_name: 'Kegel',
          description:
            'Routine personnelle de sessions Kegel et relaxation du plancher pelvien, pensée pour un usage quotidien sur téléphone.',
          lang: 'fr',
          display: 'standalone',
          orientation: 'portrait',
          scope: base,
          start_url: base,
          theme_color: '#eef1ea',
          background_color: '#f7f4ee',
          categories: ['health', 'lifestyle', 'wellness'],
          icons: [
            {
              src: 'pwa-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: 'maskable-icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
          cleanupOutdatedCaches: true,
          navigateFallback: `${base}index.html`,
        },
      }),
    ],
  };
});


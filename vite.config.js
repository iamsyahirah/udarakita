import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { handler } from './netlify/functions/air-quality.mjs'

// Run the exact Netlify handler in development and preview, without a second server.
function localAirQuality() {
  const configure = (server) => {
    server.middlewares.use('/.netlify/functions/air-quality', async (req, res, next) => {
      try {
        const result = await handler({ httpMethod: req.method })
        res.writeHead(result.statusCode, result.headers)
        res.end(result.body)
      } catch (error) {
        next(error)
      }
    })
  }
  return { name: 'local-air-quality', configureServer: configure, configurePreviewServer: configure }
}

export default defineConfig({
  plugins: [
    react(), tailwindcss(), localAirQuality(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'UdaraKita — Malaysia Air Quality',
        short_name: 'UdaraKita',
        description: 'Check Malaysian air quality readings across monitoring stations.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#101210',
        background_color: '#101210',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        // API requests must reach the network; validated offline snapshots are
        // handled by the app so saved readings always carry an explicit notice.
        navigateFallbackDenylist: [/^\/\.netlify\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
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

export default defineConfig({ plugins: [react(), tailwindcss(), localAirQuality()] })

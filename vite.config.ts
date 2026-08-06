/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'

const RAILRADAR_ROUTES: Record<string, string> = {
  '/api/railradar/lookup/trains': 'https://api.railradar.in/v1/lookup/trains',
  '/api/railradar/lookup/stations': 'https://api.railradar.in/v1/lookup/stations',
}

/**
 * `vite dev` doesn't run the Vercel functions under `api/` — this mirrors
 * them for local dev so `npm run dev` alone is enough to test RailRadar
 * features, without needing `vercel dev` + a Vercel login.
 */
function railradarDevProxy(apiKey: string | undefined): Plugin {
  return {
    name: 'railradar-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const upstreamUrl = req.url && RAILRADAR_ROUTES[req.url]
        if (!upstreamUrl) {
          next()
          return
        }
        const upstream = await fetch(upstreamUrl, {
          headers: { Authorization: `Bearer ${apiKey}` },
        })
        res.statusCode = upstream.status
        res.setHeader('Content-Type', 'application/json')
        res.end(await upstream.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      tailwindcss(),
      railradarDevProxy(env.RAIL_RADAR_API_KEY),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'icons/*.png'],
        manifest: {
          name: 'Gooo — Vacation Planner',
          short_name: 'Gooo',
          description:
            'Plan vacations intelligently by combining leave balance, holidays, weekends, and booking windows.',
          theme_color: '#0C0B0A',
          background_color: '#0C0B0A',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
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
            },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallbackDenylist: [/^\/__/],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: true,
    },
  }
})

import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vitest/config'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

/** Svi današnji pregledači znaju WOFF2, pa stariji WOFF format fontova izbacujemo (manja aplikacija). */
const woff2Only: Plugin = {
  name: 'vjezbaonica:woff2-only',
  enforce: 'pre',
  transform(code, id) {
    if (!/@fontsource[\\/].*\.css$/.test(id)) return null
    return code.replace(/,\s*url\([^)]*\.woff\)\s*format\(['"]woff['"]\)/g, '')
  },
}

export default defineConfig(({ mode }) => {
  // `npm run build:demo` pravi jednu jedinu HTML datoteku (za brzi pregled ili dijeljenje).
  const demo = mode === 'demo'

  return {
    // Relativne putanje: aplikacija radi na bilo kojoj adresi (GitHub Pages, vlastita domena...).
    base: './',
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    plugins: [
      react(),
      woff2Only,
      demo
        ? viteSingleFile()
        : VitePWA({
            registerType: 'autoUpdate',
            injectRegister: 'script',
            includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
            manifest: {
              name: 'Vježbaonica',
              short_name: 'Vježbaonica',
              description: 'Vježbanje i učenje gradiva za osnovnu školu',
              lang: 'bs',
              dir: 'ltr',
              start_url: './',
              scope: './',
              display: 'standalone',
              background_color: '#fcfdff',
              theme_color: '#1d2b6e',
              icons: [
                { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
              cleanupOutdatedCaches: true,
            },
          }),
    ],
    build: {
      outDir: demo ? 'dist-demo' : 'dist',
    },
    test: {
      environment: 'happy-dom',
      include: ['src/**/*.test.{ts,tsx}'],
      restoreMocks: true,
    },
  }
})

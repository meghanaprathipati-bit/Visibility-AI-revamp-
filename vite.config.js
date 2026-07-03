import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@gohighlevel/ghl-icons/24/outline': path.resolve(__dirname, 'src/icons/ghl-outline.js'),
    },
  },
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    cssMinify: 'esbuild',
  },
})

import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  root: 'open-to',
  base: '/open-to/',
  server: {
    port: 5173,
    open: '/open-to/'
  },
  build: {
    outDir: resolve(__dirname, 'dist/open-to'),
    emptyOutDir: true,
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      },
      mangle: true,
      format: {
        comments: false
      }
    },
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'open-to/index.html'),
        'privacy-policy': resolve(__dirname, 'open-to/privacy-policy/index.html')
      },
      output: {
        manualChunks: undefined
      }
    },
    cssMinify: true,
    assetsDir: 'assets',
    reportCompressedSize: false
  }
})
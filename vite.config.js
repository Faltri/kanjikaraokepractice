import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import fs from 'node:fs'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: 'serve-dictionary-files',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url
          if (url && url.startsWith('/dict/') && url.endsWith('.dat.gz')) {
            const filePath = path.join(process.cwd(), 'public', url)
            if (fs.existsSync(filePath)) {
              res.setHeader('Content-Type', 'application/gzip')
              // Do NOT set Content-Encoding: gzip
              const stream = fs.createReadStream(filePath)
              stream.pipe(res)
              return
            }
          }
          next()
        })
      }
    },
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['path', 'buffer', 'process', 'events'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  assetsInclude: ['**/*.gz'],
  server: {
    watch: {
      ignored: ['**/public/nlp-dicts/**']
    }
  },
  optimizeDeps: {
    include: ['kuroshiro', 'kuroshiro-analyzer-kuromoji', 'kuromoji']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'kuroshiro': ['kuroshiro', 'kuroshiro-analyzer-kuromoji']
        }
      }
    }
  }
})

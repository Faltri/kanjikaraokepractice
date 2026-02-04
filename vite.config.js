import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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

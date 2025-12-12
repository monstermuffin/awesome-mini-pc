import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from '@rollup/plugin-yaml'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    yaml(),
  ],
  publicDir: 'data',
  server: {
    fs: {
      allow: [
        'data',
        'src',
      ],
    },
  },
  build: {
    assetsInclude: ['**/*.yaml'],
  },
  base: './',
}) 
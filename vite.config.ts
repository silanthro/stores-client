import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  server: {
    port: 5173,
  },
  plugins: [vue(), tailwindcss()],
})

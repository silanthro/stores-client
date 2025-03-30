import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'Silanthro - Stores',
      htmlAttrs: {
        lang: 'en',
      },
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  modules: ['@nuxt/content', '@pinia/nuxt'],
  compatibilityDate: '2025-03-19',
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/main.css', '~/assets/css/markdown.css'],
  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['python', 'toml'],
          theme: {
            default: 'github-light-high-contrast',
            dark: 'monokai',
          },
        },
      },
    },
  },
})

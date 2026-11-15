export default defineNuxtConfig({
  compatibilityDate: '2026-11-15',
  ssr: true,
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    apiBase: 'http://127.0.0.1:48080/app-api/blog',
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [{ name: 'theme-color', content: '#090b13' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  nitro: { preset: 'node-server' },
  typescript: { strict: true },
})

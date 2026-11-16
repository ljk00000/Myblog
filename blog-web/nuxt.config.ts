import { readFileSync } from 'node:fs'
import type { PagesSnapshot } from './shared/types/pages'
import { readOwnerAuthConfig } from './shared/utils/ownerAuth'

const pagesExport = process.env.BLOG_PAGES_EXPORT === '1'
const snapshot: PagesSnapshot | undefined = pagesExport ? JSON.parse(readFileSync(new URL('./public/pages-snapshot.json', import.meta.url), 'utf8')) : undefined
const baseURL = snapshot ? `${new URL(snapshot.site.siteUrl).pathname.replace(/\/$/, '')}/` : '/'
const ownerAuth = readOwnerAuthConfig({
  supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ownerUserId: process.env.NUXT_PUBLIC_OWNER_USER_ID,
})

export default defineNuxtConfig({
  compatibilityDate: '2026-11-15',
  ssr: true,
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    apiBase: 'http://127.0.0.1:48080/app-api/blog',
    pagesSnapshot: snapshot ? JSON.stringify(snapshot) : '',
    public: { pagesExport, supabaseUrl: ownerAuth?.url || '', supabasePublishableKey: ownerAuth?.key || '', ownerUserId: ownerAuth?.ownerId || '' },
  },
  app: {
    baseURL,
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [{ name: 'theme-color', content: '#17191c' }],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${baseURL}favicon.svg` }],
    },
  },
  nitro: {
    preset: pagesExport ? 'static' : 'node-server',
    ...(snapshot ? { prerender: { crawlLinks: false, failOnError: true, routes: ['/', '/articles', '/resources', '/archives', '/tech-stack', '/about', '/search', '/login', ...snapshot.articles.map(item => `/articles/${item.slug}`), ...snapshot.resources.map(item => `/resources/${item.slug}`)] } } : {}),
  },
  typescript: { strict: true },
})

import type { Site } from '../../shared/types/blog'
import { safeUrl } from '../../shared/utils/format'

export default defineEventHandler(async event => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  const site = await $fetch<Site>('/api/blog/site/get')
  const base = safeUrl(site.siteUrl, false)
  if (!base) throw createError({ statusCode: 503, message: '站点规范网址尚未配置' })
  return `User-agent: *\nAllow: /\nDisallow: /search\nDisallow: /api/\nSitemap: ${base.replace(/\/$/, '')}/sitemap.xml\n`
})

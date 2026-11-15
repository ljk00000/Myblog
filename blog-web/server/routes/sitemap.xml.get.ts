import type { Site, SitemapEntry } from '../../shared/types/blog'
import { isoDate, safeUrl } from '../../shared/utils/format'

const escapeXml = (value: string) => value.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
export default defineEventHandler(async event => {
  const [site, entries] = await Promise.all([
    $fetch<Site>('/api/blog/site/get'),
    $fetch<SitemapEntry[]>('/api/blog/sitemap'),
  ])
  const base = safeUrl(site.siteUrl, false)
  if (!base) throw createError({ statusCode: 503, message: '站点规范网址尚未配置' })
  const origin = base.replace(/\/$/, '')
  const urls = new Map<string, string | undefined>(['/', '/articles', '/resources', '/archives', '/about'].map(path => [path, undefined]))
  for (const entry of entries) {
    // Only published detail URLs supplied by Java; never arbitrary external URLs.
    if (/^\/(articles|resources)\/[a-z0-9-]{1,120}$/.test(entry.path)) urls.set(entry.path, isoDate(entry.updateTime))
  }
  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...urls].map(([path, date]) => `<url><loc>${escapeXml(origin + path)}</loc>${date ? `<lastmod>${escapeXml(date)}</lastmod>` : ''}</url>`).join('')}</urlset>`
})

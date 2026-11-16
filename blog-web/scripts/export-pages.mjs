import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = fileURLToPath(new URL('../', import.meta.url))
const apiBase = (process.env.PAGES_API_BASE || 'http://127.0.0.1:48080/app-api/blog').replace(/\/$/, '')
if (!process.env.PAGES_SITE_URL) throw new Error('Set PAGES_SITE_URL to the public HTTPS Pages address before exporting.')
const siteUrl = new URL(process.env.PAGES_SITE_URL)
if (siteUrl.protocol !== 'https:' || siteUrl.username || siteUrl.password || siteUrl.search || siteUrl.hash) throw new Error('PAGES_SITE_URL must be an absolute HTTPS URL without credentials, query or fragment.')
const canonicalSite = siteUrl.href.replace(/\/$/, '')
const basePath = `${siteUrl.pathname.replace(/\/$/, '')}/`
const generatedFiles = ['pages-snapshot.json', 'robots.txt', 'sitemap.xml', '.nojekyll'].map(name => path.join(root, 'public', name))
const writtenFiles = []
const output = path.join(root, '.pages-output')
const escapeXml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char])

async function api(route, query = {}) {
  const url = new URL(`${apiBase}/${route}`)
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value))
  const response = await fetch(url, { headers: { Accept: 'application/json' }, redirect: 'error', signal: AbortSignal.timeout(15000) })
  if (!response.ok) throw new Error(`Public export ${route}: HTTP ${response.status}`)
  const result = await response.json()
  if (result.code !== 0 || result.data === undefined) throw new Error(`Public export ${route}: unsuccessful public response`)
  return result.data
}
async function content(kind) {
  const items = []
  let total = 0
  for (let pageNo = 1; ; pageNo++) {
    const result = await api(`${kind}/page`, { pageNo, pageSize: 100 })
    if (!Array.isArray(result.list) || !Number.isSafeInteger(result.total)) throw new Error(`Invalid public ${kind} page`)
    total = result.total
    if (result.list.length === 0 && items.length < total) throw new Error(`Public ${kind} changed during export; retry the export`)
    for (const item of result.list) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) throw new Error(`Invalid public ${kind} slug`)
      items.push(await api(`${kind}/get`, { slug: item.slug }))
    }
    if (items.length >= total) break
  }
  if (new Set(items.map(item => item.slug)).size !== total || items.length !== total) throw new Error(`Public ${kind} changed during export; retry the export`)
  return items
}
function urlForPages(value, asset = false) {
  if (!value || value.startsWith('#') || value.startsWith('mailto:')) return value
  if (value.startsWith('/') && !value.startsWith('//')) {
    if (asset && value !== '/favicon.svg') throw new Error(`A relative image needs a public URL before Pages export: ${value}`)
    return `${basePath}${value.slice(1)}`
  }
  const url = new URL(value)
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (!['https:', 'http:'].includes(url.protocol) || /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname) || hostname === '::1' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) throw new Error(`A local or unsupported link needs a public URL before Pages export: ${value}`)
  return value
}
function htmlForPages(html) {
  return (html || '').replace(/\b(href|src)="([^"]+)"/g, (_match, attribute, value) => `${attribute}="${urlForPages(value, attribute === 'src')}"`)
}
async function runNuxt(command) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, 'node_modules/nuxt/bin/nuxt.mjs'), command], { cwd: root, env: { ...process.env, BLOG_PAGES_EXPORT: '1' }, stdio: 'inherit' })
    child.on('error', reject)
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`Nuxt ${command} exited with ${code}`)))
  })
}

try {
  for (const file of generatedFiles) {
    try { await access(file) } catch (error) { if (error.code === 'ENOENT') continue; throw error }
    throw new Error(`Refusing to replace an existing public file: ${path.basename(file)}`)
  }
  const [site, categories, tags, archives, sitemap, articles, resources] = await Promise.all([
    api('site/get'), api('category/list'), api('tag/list'), api('article/archives'), api('sitemap'), content('article'), content('resource'),
  ])
  site.siteUrl = canonicalSite
  site.avatarUrl = urlForPages(site.avatarUrl, true)
  site.githubUrl = urlForPages(site.githubUrl)
  site.aboutHtml = htmlForPages(site.aboutHtml)
  for (const item of [...articles, ...resources]) {
    item.coverUrl = urlForPages(item.coverUrl, true)
    item.contentHtml = htmlForPages(item.contentHtml)
    if ('url' in item) item.url = urlForPages(item.url)
  }
  const snapshot = { exportedAt: new Date().toISOString(), site, categories, tags, archives, sitemap, articles, resources }
  const paths = ['/', '/articles', '/resources', '/archives', '/tech-stack', '/about', ...articles.map(item => `/articles/${item.slug}`), ...resources.map(item => `/resources/${item.slug}`)]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(route => `<url><loc>${escapeXml(canonicalSite + (route === '/' ? '/' : route))}</loc></url>`).join('')}</urlset>\n`
  const robots = `User-agent: *\nAllow: ${basePath}\nDisallow: ${basePath}search\nDisallow: ${basePath}api/\nSitemap: ${canonicalSite}/sitemap.xml\n`
  for (const [index, value] of [JSON.stringify(snapshot), robots, xml, ''].entries()) {
    await writeFile(generatedFiles[index], value, { flag: 'wx' })
    writtenFiles.push(generatedFiles[index])
  }
  await runNuxt('typecheck')
  await runNuxt('generate')
  for (const route of [...paths, '/search']) {
    const file = path.join(root, '.output/public', route.slice(1), 'index.html')
    const html = await readFile(file, 'utf8')
    if (html.includes('state-error') || html.includes('站点信息暂时无法加载')) throw new Error(`Prerendered content failed to load: ${route}`)
  }
  await rm(output, { recursive: true, force: true })
  await mkdir(output, { recursive: true })
  await cp(path.join(root, '.output/public'), output, { recursive: true })
  await cp(path.join(root, '../LICENSE'), path.join(output, 'LICENSE'))
  await access(path.join(output, 'index.html'))
  await access(path.join(output, '404.html'))
  const generatedSnapshot = JSON.parse(await readFile(path.join(output, 'pages-snapshot.json'), 'utf8'))
  if (generatedSnapshot.site.siteUrl !== canonicalSite) throw new Error('Generated snapshot URL mismatch')
  console.log(JSON.stringify({ output, siteUrl: canonicalSite, articles: articles.length, resources: resources.length, staticPages: paths.length + 1 }))
} finally {
  for (const file of writtenFiles) await rm(file, { force: true })
}

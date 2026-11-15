import type { Article, Resource } from '../types/blog'
import type { PagesSnapshot } from '../types/pages'
import { isoDate } from './format'

type Query = Record<string, unknown>
const present = (value: unknown) => value !== undefined && value !== null && value !== ''
const text = (value: unknown) => String(value ?? '')
const boolean = (value: unknown) => value === true || value === 'true'
function page<T>(items: T[], query: Query) {
  const number = Math.max(1, Math.min(100000, Number(query.pageNo) || 1))
  const size = Math.max(1, Math.min(100, Number(query.pageSize) || 12))
  return { list: items.slice((number - 1) * size, number * size), total: items.length }
}
function summary<T extends Article | Resource>(item: T) {
  const { contentHtml: _html, toc: _toc, ...value } = item
  return value
}
function matches(item: Article | Resource, value: unknown) {
  const keyword = text(value).toLocaleLowerCase()
  const body = item.contentHtml.replace(/<[^>]*>/g, ' ')
  return `${item.title}\n${item.summary || ''}\n${body}`.toLocaleLowerCase().includes(keyword)
}

/** Read only the published public snapshot; this module never calls an admin API. */
export function resolvePagesQuery(snapshot: PagesSnapshot, path: string, query: Query = {}): unknown {
  switch (path.replace(/^\/api\/blog\//, '')) {
    case 'site/get': return snapshot.site
    case 'category/list': return snapshot.categories.filter(item => !present(query.type) || item.type === query.type)
    case 'tag/list': return snapshot.tags
    case 'article/archives': return snapshot.archives
    case 'sitemap': return snapshot.sitemap
    case 'article/page': {
      const articles = snapshot.articles.filter(item =>
        (!present(query.categoryId) || item.categoryId === Number(query.categoryId)) &&
        (!present(query.tagId) || item.tags.some(tag => tag.id === Number(query.tagId))) &&
        (!present(query.pinned) || item.pinned === boolean(query.pinned)) &&
        (!present(query.yearMonth) || isoDate(item.publishTime)?.slice(0, 7) === query.yearMonth) &&
        matches(item, query.keyword),
      )
      return page(articles.map(summary), query)
    }
    case 'resource/page': {
      const resources = snapshot.resources.filter(item =>
        (!present(query.categoryId) || item.categoryId === Number(query.categoryId)) &&
        (!present(query.type) || item.type === query.type) &&
        (!present(query.featured) || item.featured === boolean(query.featured)) &&
        matches(item, query.keyword),
      )
      return page(resources.map(summary), query)
    }
    case 'article/get': {
      const article = snapshot.articles.find(item => item.slug === query.slug)
      if (article) return article
      break
    }
    case 'resource/get': {
      const resource = snapshot.resources.find(item => item.slug === query.slug)
      if (resource) return resource
      break
    }
  }
  throw Object.assign(new Error('内容不存在或未包含在这次公开快照中'), { statusCode: 404 })
}

import type { ArchiveMonth, Article, Resource, Category, Tag, Site, SitemapEntry } from './blog'

export interface PagesSnapshot {
  exportedAt: string
  site: Site
  categories: Category[]
  tags: Tag[]
  articles: Article[]
  resources: Resource[]
  archives: ArchiveMonth[]
  sitemap: SitemapEntry[]
}

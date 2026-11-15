export type BlogDate = string | number[] | null
export interface CommonResult<T> { code: number; data: T; msg: string }
export interface PageResult<T> { list: T[]; total: number }
export interface Category { id: number; name: string; slug: string; type: 'article' | 'resource'; sort: number }
export interface Tag { id: number; name: string; slug: string }
export interface TocEntry { id: string; text: string; level: number }
export interface ArticleSummary {
  id: number
  title: string
  slug: string
  summary: string | null
  coverUrl: string | null
  categoryId: number | null
  categoryName: string | null
  tags: Tag[]
  pinned: boolean
  publishTime: BlogDate
  readingMinutes: number
  seoTitle?: string | null
  seoDescription?: string | null
}
export interface Article extends ArticleSummary { contentHtml: string; toc: TocEntry[] }
export interface ResourceSummary {
  id: number
  title: string
  slug: string
  summary: string | null
  type: 'link' | 'file'
  url: string
  coverUrl: string | null
  categoryId: number | null
  categoryName: string | null
  featured: boolean
  sort: number
  publishTime: BlogDate
  seoTitle?: string | null
  seoDescription?: string | null
}
export interface Resource extends ResourceSummary { contentHtml: string; toc: TocEntry[] }
export interface Site {
  title: string
  subtitle: string
  description: string
  authorName: string
  avatarUrl: string
  aboutHtml: string
  siteUrl: string
  githubUrl: string
  email: string
  footerText: string
}
export interface ArchiveMonth { yearMonth: string; total: number }
export interface SitemapEntry { path: string; updateTime: BlogDate }

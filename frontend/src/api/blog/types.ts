export type ContentKind = 'article' | 'resource'
export type ContentStatus = 0 | 1 | 2
export type ResourceType = 'link' | 'file'
export type BlogDate = string | number[] | null

export interface PageResult<T> {
  list: T[]
  total: number
}

export interface TocEntry {
  id: string
  text: string
  level: number
}

export interface Category {
  id: number
  name: string
  slug: string
  type: ContentKind
  sort: number
}

export type CategorySave = Omit<Category, 'id'>

export interface Tag {
  id: number
  name: string
  slug: string
}

export type TagSave = Omit<Tag, 'id'>

export interface ContentSave {
  title: string
  slug: string
  summary: string
  contentMarkdown: string
  coverUrl: string
  categoryId: number | null
  status: ContentStatus
  seoTitle: string
  seoDescription: string
}

export interface ArticleSave extends ContentSave {
  tagIds: number[]
  pinned: boolean
}

export interface ResourceSave extends ContentSave {
  type: ResourceType
  url: string
  featured: boolean
  sort: number
}

interface ContentMetadata {
  id: number
  categoryName?: string
  publishTime?: BlogDate
  createTime?: BlogDate
  updateTime?: BlogDate
}

// 分页接口不返回正文；get 接口才返回 Markdown、HTML 和目录。
export interface ArticleRow extends Omit<ArticleSave, 'contentMarkdown'>, ContentMetadata {
  tags: Tag[]
  readingMinutes?: number
}

export interface Article extends ArticleRow {
  contentMarkdown: string
  contentHtml: string
  toc: TocEntry[]
}

export interface ResourceRow extends Omit<ResourceSave, 'contentMarkdown'>, ContentMetadata {}

export interface Resource extends ResourceRow {
  contentMarkdown: string
  contentHtml: string
  toc: TocEntry[]
}

export interface ContentPageParams {
  pageNo: number
  pageSize: number
  keyword?: string
  categoryId?: number
  status?: ContentStatus
}

export interface ArticlePageParams extends ContentPageParams {
  tagId?: number
}

export interface ResourcePageParams extends ContentPageParams {
  type?: ResourceType
}

export interface SiteSave {
  title: string
  subtitle: string
  description: string
  authorName: string
  avatarUrl: string
  aboutMarkdown: string
  siteUrl: string
  githubUrl: string
  email: string
  footerText: string
}

export interface Site extends SiteSave {
  aboutHtml: string
}

export interface PreviewResult {
  html: string
  toc: TocEntry[]
  readingMinutes: number
}

// 保存白名单：不回传服务端 HTML、发布时间、租户和审计字段。
const contentSave = (value: ContentSave): ContentSave => ({
  title: value.title,
  slug: value.slug,
  summary: value.summary ?? '',
  contentMarkdown: value.contentMarkdown ?? '',
  coverUrl: value.coverUrl ?? '',
  categoryId: value.categoryId ?? null,
  status: value.status,
  seoTitle: value.seoTitle ?? '',
  seoDescription: value.seoDescription ?? ''
})

export const toArticleSave = (value: ArticleSave): ArticleSave => ({
  ...contentSave(value),
  tagIds: [...(value.tagIds ?? [])],
  pinned: value.pinned
})

export const toResourceSave = (value: ResourceSave): ResourceSave => ({
  ...contentSave(value),
  type: value.type,
  url: value.url,
  featured: value.featured,
  sort: value.sort
})

export const toSiteSave = (value: SiteSave): SiteSave => ({
  title: value.title,
  subtitle: value.subtitle ?? '',
  description: value.description ?? '',
  authorName: value.authorName,
  avatarUrl: value.avatarUrl ?? '',
  aboutMarkdown: value.aboutMarkdown ?? '',
  siteUrl: value.siteUrl,
  githubUrl: value.githubUrl ?? '',
  email: value.email ?? '',
  footerText: value.footerText ?? ''
})

import { createError, getQuery, type H3Event } from 'h3'
import type { CommonResult } from '../../shared/types/blog'

type Validator = (value: string) => boolean
const positive: Validator = value => /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value))
const boolean: Validator = value => value === 'true' || value === 'false'
const keyword: Validator = value => value.length <= 200 && !/[\u0000-\u001f]/.test(value)
const slug: Validator = value => /^[a-z0-9-]{1,120}$/.test(value)
const page = { pageNo: positive, pageSize: (value: string) => positive(value) && Number(value) <= 100 }
const paths: Record<string, Record<string, Validator>> = {
  'site/get': {},
  'category/list': { type: value => ['article', 'resource'].includes(value) },
  'tag/list': {},
  'article/page': { ...page, keyword, categoryId: positive, tagId: positive, pinned: boolean, yearMonth: value => /^\d{4}-(0[1-9]|1[0-2])$/.test(value) },
  'article/get': { slug },
  'article/archives': {},
  'resource/page': { ...page, keyword, categoryId: positive, type: value => ['link', 'file'].includes(value), featured: boolean },
  'resource/get': { slug },
  sitemap: {},
}

export function blogQuery(event: H3Event, path: string): Record<string, string | number> {
  if (!Object.hasOwn(paths, path)) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: '接口不存在' })
  const allowed = paths[path]!
  const query: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(getQuery(event))) {
    if (!Object.hasOwn(allowed, key) || typeof value !== 'string' || !allowed[key]!(value)) {
      throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '查询参数不符合接口约定' })
    }
    query[key] = value
  }
  if (path.endsWith('/get') && path !== 'site/get' && !query.slug) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: '缺少内容标识' })
  }
  if (path.endsWith('/page')) {
    query.pageNo ??= 1
    query.pageSize ??= 12
  }
  return query
}

export async function fetchBlog(event: H3Event, path: string, query: Record<string, string | number>): Promise<unknown> {
  const rawBase = useRuntimeConfig(event).apiBase
  let base: URL
  try {
    base = new URL(rawBase)
    if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) throw new Error('Invalid base')
  } catch {
    throw createError({ statusCode: 503, statusMessage: 'Service Unavailable', message: '博客接口地址尚未正确配置' })
  }
  let result: CommonResult<unknown>
  try {
    // Intentionally construct a fresh request. Never forward visitor headers/cookies.
    result = await $fetch<CommonResult<unknown>>(`${base.href.replace(/\/$/, '')}/${path}`, {
      method: 'GET', query, headers: { accept: 'application/json' },
      retry: 0, timeout: 10_000, redirect: 'error',
    })
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } }).response?.status
    throw createError({
      statusCode: status === 404 ? 404 : 502,
      statusMessage: status === 404 ? 'Not Found' : 'Bad Gateway',
      message: status === 404 ? '内容不存在或尚未公开' : '暂时无法连接博客服务，请稍后重试',
    })
  }
  if (!result || typeof result.code !== 'number' || !Object.hasOwn(result, 'data')) {
    throw createError({ statusCode: 502, statusMessage: 'Bad Gateway', message: '博客服务返回了无法识别的数据' })
  }
  if (result.code !== 0) {
    const statusCode = Number.isInteger(result.code) && result.code >= 400 && result.code <= 599 ? result.code : 502
    throw createError({ statusCode, message: statusCode === 404 ? '内容不存在或尚未公开' : '博客服务暂时无法处理请求' })
  }
  if (result.data == null) throw createError({ statusCode: 502, message: '博客服务暂未提供所需数据' })
  return result.data
}

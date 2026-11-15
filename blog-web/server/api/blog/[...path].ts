import { blogQuery, fetchBlog } from '../../utils/blog'

export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  if (event.method !== 'GET') {
    setHeader(event, 'Allow', 'GET')
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed', message: '公开接口仅支持 GET' })
  }
  const path = getRouterParam(event, 'path') || ''
  const query = blogQuery(event, path)
  return fetchBlog(event, path, query)
})

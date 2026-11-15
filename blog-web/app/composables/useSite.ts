import type { Site } from '#shared/types/blog'

export function useSite() {
  const request = useBlogRequest()
  return useAsyncData<Site>('blog-site', () => request('/api/blog/site/get'), {
    getCachedData: (key, app) => app.isHydrating ? app.payload.data[key] : undefined,
  })
}

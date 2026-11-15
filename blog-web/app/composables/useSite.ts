import type { Site } from '#shared/types/blog'

export function useSite() {
  return useAsyncData<Site>('blog-site', () => $fetch('/api/blog/site/get'), {
    getCachedData: (key, app) => app.isHydrating ? app.payload.data[key] : undefined,
  })
}

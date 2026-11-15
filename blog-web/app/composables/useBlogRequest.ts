import type { PagesSnapshot } from '#shared/types/pages'
import { resolvePagesQuery } from '#shared/utils/pages'

let snapshotPromise: Promise<PagesSnapshot> | undefined

export function useBlogRequest(): typeof $fetch {
  const config = useRuntimeConfig()
  if (!config.public.pagesExport) return $fetch
  const snapshotUrl = `${config.app.baseURL}pages-snapshot.json`
  return (async (path: string, options?: { query?: Record<string, unknown> }) => {
    snapshotPromise ??= import.meta.server
      ? Promise.resolve(JSON.parse(config.pagesSnapshot) as PagesSnapshot)
      : $fetch<PagesSnapshot>(snapshotUrl).catch(error => {
          snapshotPromise = undefined
          throw error
        })
    return resolvePagesQuery(await snapshotPromise, path, options?.query)
  }) as typeof $fetch
}

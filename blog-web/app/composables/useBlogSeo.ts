import type { Site } from '#shared/types/blog'
import { safeUrl } from '#shared/utils/format'

interface SeoOptions { title: string; description: string; image?: string | null; type?: 'website' | 'article'; noindex?: boolean; path?: string }
export function useBlogSeo(options: () => SeoOptions) {
  const { data: site } = useNuxtData<Site>('blog-site')
  const route = useRoute()
  const requestOrigin = useRequestURL().origin
  const title = computed(() => [options().title, site.value?.title || 'Myblog'].filter(Boolean).join(' · '))
  const description = computed(() => options().description || site.value?.description || site.value?.subtitle || '阅读文章，发现资源。')
  const canonical = computed(() => `${(safeUrl(site.value?.siteUrl, false) || requestOrigin).replace(/\/$/, '')}${options().path || route.path}`)
  const image = computed(() => {
    const value = safeUrl(options().image)
    return value ? new URL(value, canonical.value).href : undefined
  })
  useSeoMeta({
    title: () => title.value,
    description: () => description.value,
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogType: () => options().type || 'website',
    ogUrl: () => canonical.value,
    ogSiteName: () => site.value?.title || 'Myblog',
    ogLocale: 'zh_CN',
    ogImage: () => image.value,
    twitterCard: () => image.value ? 'summary_large_image' : 'summary',
    robots: () => options().noindex ? 'noindex, follow' : 'index, follow',
  })
  useHead(() => ({ link: [{ rel: 'canonical', href: canonical.value }] }))
}

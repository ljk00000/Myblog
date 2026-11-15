<script setup lang="ts">
import type { ArticleSummary, PageResult, ResourceSummary, Site } from '#shared/types/blog'
const { data: site } = useNuxtData<Site>('blog-site')
const titleLines = computed(() => {
  const title = site.value?.subtitle || '记录思考，分享发现'
  const split = title.search(/[，,。]/u)
  return split > 0 && split < title.length - 1 ? [title.slice(0, split + 1), title.slice(split + 1)] : [title]
})
const [{ data: articles, error: articleError, status: articleStatus, refresh: refreshArticles }, { data: resources, error: resourceError, status: resourceStatus, refresh: refreshResources }] = await Promise.all([
  useFetch<PageResult<ArticleSummary>>('/api/blog/article/page', { query: { pageNo: 1, pageSize: 4 } }),
  useFetch<PageResult<ResourceSummary>>('/api/blog/resource/page', { query: { pageNo: 1, pageSize: 3, featured: true } }),
])
useBlogSeo(() => ({ title: '首页', description: site.value?.description || site.value?.subtitle || '阅读最新文章，发现精选资源。' }))
</script>
<template>
  <div class="home-page">
    <section class="home-intro" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="hero-kicker"><span aria-hidden="true" />{{ site?.title || 'Myblog' }}<span class="kicker-divider" aria-hidden="true">/</span>文字与发现的空间</p>
        <h1 id="home-title"><span v-for="(line, index) in titleLines" :key="index" class="hero-title-line">{{ line }}</span></h1>
        <p class="intro-description">{{ site?.description || '在文字中停留，在探索中相遇。读一篇文章，发现一份值得留存的资源。' }}</p>
        <div class="intro-actions"><NuxtLink class="button" to="/articles">开始阅读 <AppIcon name="arrow" /></NuxtLink><NuxtLink class="button button-secondary" to="/resources">发现资源 <AppIcon name="external" /></NuxtLink></div>
        <div class="hero-footnote"><span class="tiny-star" aria-hidden="true">✦</span><span>思考被记录，灵感被看见。</span></div>
      </div>
      <AuroraBook />
      <a class="hero-scroll" href="#latest"><span>向下发现</span><span aria-hidden="true">↓</span></a>
    </section>
    <section id="latest" class="home-section reveal" aria-labelledby="latest-title">
      <div class="section-heading"><div><p class="eyebrow"><span class="section-index">01</span> LATEST WRITING</p><h2 id="latest-title">最近，写下的<span class="title-dot">.</span></h2></div><NuxtLink class="text-link" to="/articles">全部文章 <AppIcon name="arrow" /></NuxtLink></div>
      <ContentState v-if="articleStatus === 'pending'" kind="loading" />
      <ContentState v-else-if="articleError" kind="error" title="文章暂时无法加载" description="博客服务暂时不可用，请稍后重试。" retry @retry="refreshArticles()" />
      <div v-else-if="articles?.list.length" class="article-list home-articles"><ArticleCard v-for="article in articles.list" :key="article.id" :article="article" /></div>
      <div v-else class="home-empty spotlight">
        <div class="empty-manuscript" aria-hidden="true"><span /><span /><span /><i>✦</i></div>
        <div class="home-empty-copy"><p class="eyebrow">A LITTLE SPACE FOR WHAT'S NEXT</p><h3>留一页空白，等新的思考。</h3><p>还没有公开文章。文字准备好后，会在这里与你见面。</p><NuxtLink to="/articles" class="text-link">前往文章页 <AppIcon name="arrow" /></NuxtLink></div>
        <span class="empty-side-note" aria-hidden="true">TO BE WRITTEN</span>
      </div>
    </section>
    <section class="home-section reveal" aria-labelledby="featured-title">
      <div class="section-heading"><div><p class="eyebrow"><span class="section-index">02</span> SELECTED RESOURCES</p><h2 id="featured-title">发现，值得留存的<span class="title-dot">.</span></h2></div><NuxtLink class="text-link" to="/resources">全部资源 <AppIcon name="arrow" /></NuxtLink></div>
      <ContentState v-if="resourceStatus === 'pending'" kind="loading" />
      <ContentState v-else-if="resourceError" kind="error" title="资源暂时无法加载" description="博客服务暂时不可用，请稍后重试。" retry @retry="refreshResources()" />
      <div v-else-if="resources?.list.length" class="resource-grid"><ResourceCard v-for="resource in resources.list" :key="resource.id" :resource="resource" /></div>
      <div v-else class="resource-empty"><span class="resource-empty-symbol" aria-hidden="true">↗</span><div><h3>好发现，慢慢收集。</h3><p>暂时没有精选资源，更多公开内容可以在资源页查找。</p></div><NuxtLink to="/resources" class="button button-secondary">浏览资源 <AppIcon name="arrow" /></NuxtLink></div>
    </section>
    <NuxtLink to="/archives" class="archive-invitation reveal"><span class="eyebrow">THE JOURNAL, THROUGH TIME</span><span>沿着时间，翻阅文字。 <span aria-hidden="true">↗</span></span><span class="invitation-caption">进入归档</span></NuxtLink>
  </div>
</template>

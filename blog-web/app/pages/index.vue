<script setup lang="ts">
import type { ArticleSummary, PageResult, ResourceSummary, Site } from '#shared/types/blog'
const { data: site } = useNuxtData<Site>('blog-site')
const [{ data: articles, error: articleError, status: articleStatus, refresh: refreshArticles }, { data: resources, error: resourceError, status: resourceStatus, refresh: refreshResources }] = await Promise.all([
  useFetch<PageResult<ArticleSummary>>('/api/blog/article/page', { query: { pageNo: 1, pageSize: 5 } }),
  useFetch<PageResult<ResourceSummary>>('/api/blog/resource/page', { query: { pageNo: 1, pageSize: 3, featured: true } }),
])
useBlogSeo(() => ({ title: '首页', description: site.value?.description || site.value?.subtitle || '阅读最新文章，发现精选资源。' }))
</script>
<template>
  <div>
    <section class="home-intro" aria-labelledby="home-title">
      <div class="intro-rule" aria-hidden="true" /><p class="eyebrow">{{ site?.title || 'Myblog' }}</p>
      <h1 id="home-title">{{ site?.subtitle || '文章与资源' }}</h1>
      <p v-if="site?.description" class="intro-description">{{ site.description }}</p>
      <div class="intro-actions"><NuxtLink class="button" to="/articles">开始阅读 <AppIcon name="arrow" /></NuxtLink><NuxtLink class="text-link" to="/about">关于这里 <span aria-hidden="true">↗</span></NuxtLink></div>
    </section>
    <section class="home-section" aria-labelledby="latest-title">
      <div class="section-heading"><div><p class="eyebrow">LATEST WRITING</p><h2 id="latest-title">最新文章</h2></div><NuxtLink class="text-link" to="/articles">全部文章 <AppIcon name="arrow" /></NuxtLink></div>
      <ContentState v-if="articleStatus === 'pending'" kind="loading" />
      <ContentState v-else-if="articleError" kind="error" title="文章暂时无法加载" description="博客服务暂时不可用，请稍后重试。" retry @retry="refreshArticles()" />
      <div v-else-if="articles?.list.length" class="article-list"><ArticleCard v-for="article in articles.list" :key="article.id" :article="article" /></div>
      <ContentState v-else title="第一篇文章，还在路上" description="已发布的文章会出现在这里，欢迎之后再来看看。" />
    </section>
    <section class="home-section" aria-labelledby="featured-title">
      <div class="section-heading"><div><p class="eyebrow">SELECTED RESOURCES</p><h2 id="featured-title">精选资源</h2></div><NuxtLink class="text-link" to="/resources">全部资源 <AppIcon name="arrow" /></NuxtLink></div>
      <ContentState v-if="resourceStatus === 'pending'" kind="loading" />
      <ContentState v-else-if="resourceError" kind="error" title="资源暂时无法加载" description="博客服务暂时不可用，请稍后重试。" retry @retry="refreshResources()" />
      <div v-else-if="resources?.list.length" class="resource-grid"><ResourceCard v-for="resource in resources.list" :key="resource.id" :resource="resource" /></div>
      <ContentState v-else title="暂时没有精选资源" description="可以前往资源页，查看已公开的全部资源。"><NuxtLink to="/resources" class="text-link">浏览全部资源 <AppIcon name="arrow" /></NuxtLink></ContentState>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { ArticleSummary, PageResult, ResourceSummary, Site } from '#shared/types/blog'
const { data: site } = useNuxtData<Site>('blog-site')
const [{ data: articles, error: articleError, status: articleStatus, refresh: refreshArticles }, { data: resources, error: resourceError, status: resourceStatus, refresh: refreshResources }] = await Promise.all([
  useFetch<PageResult<ArticleSummary>>('/api/blog/article/page', { $fetch: useBlogRequest(), query: { pageNo: 1, pageSize: 4 } }),
  useFetch<PageResult<ResourceSummary>>('/api/blog/resource/page', { $fetch: useBlogRequest(), query: { pageNo: 1, pageSize: 3, featured: true } }),
])
useBlogSeo(() => ({ title: '首页', description: site.value?.description || '最新文章和精选资源。' }))
</script>
<template>
  <div class="home-page">
    <section id="latest" class="home-section" aria-labelledby="latest-title">
      <div class="section-heading"><h1 id="latest-title">最新文章</h1><NuxtLink class="text-link" to="/articles">全部文章 <AppIcon name="arrow" /></NuxtLink></div>
      <ContentState v-if="articleStatus === 'pending'" kind="loading" />
      <ContentState v-else-if="articleError" kind="error" title="文章加载失败" description="请稍后重试。" retry @retry="refreshArticles()" />
      <div v-else-if="articles?.list.length" class="article-list"><ArticleCard v-for="article in articles.list" :key="article.id" :article="article" /></div>
      <ContentState v-else title="暂无文章" description="还没有公开文章。" />
    </section>
    <section class="home-section" aria-labelledby="featured-title">
      <div class="section-heading"><h2 id="featured-title">精选资源</h2><NuxtLink class="text-link" to="/resources">全部资源 <AppIcon name="arrow" /></NuxtLink></div>
      <ContentState v-if="resourceStatus === 'pending'" kind="loading" />
      <ContentState v-else-if="resourceError" kind="error" title="资源加载失败" description="请稍后重试。" retry @retry="refreshResources()" />
      <div v-else-if="resources?.list.length" class="resource-grid"><ResourceCard v-for="resource in resources.list" :key="resource.id" :resource="resource" /></div>
      <ContentState v-else title="暂无精选资源"><NuxtLink to="/resources" class="text-link">查看全部资源 <AppIcon name="arrow" /></NuxtLink></ContentState>
    </section>
  </div>
</template>

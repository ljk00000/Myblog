<script setup lang="ts">
import type { ArticleSummary, PageResult, ResourceSummary } from '#shared/types/blog'
const route = useRoute()
const request = useBlogRequest()
const q = computed(() => textQuery(route.query.q))
const input = ref(q.value)
const articlePage = computed(() => positiveQuery(route.query.articlePage))
const resourcePage = computed(() => positiveQuery(route.query.resourcePage))
watch(q, value => { input.value = value })
const [articles, resources] = await Promise.all([
  useAsyncData(computed(() => `search-articles:${q.value}:${articlePage.value}`), () => q.value ? request<PageResult<ArticleSummary>>('/api/blog/article/page', { query: { keyword: q.value, pageNo: articlePage.value, pageSize: 6 } }) : Promise.resolve({ list: [] as ArticleSummary[], total: 0 })),
  useAsyncData(computed(() => `search-resources:${q.value}:${resourcePage.value}`), () => q.value ? request<PageResult<ResourceSummary>>('/api/blog/resource/page', { query: { keyword: q.value, pageNo: resourcePage.value, pageSize: 6 } }) : Promise.resolve({ list: [] as ResourceSummary[], total: 0 })),
])
const { data: articleData, error: articleError, status: articleStatus, refresh: refreshArticles } = articles
const { data: resourceData, error: resourceError, status: resourceStatus, refresh: refreshResources } = resources
const searching = computed(() => articleStatus.value === 'pending' || resourceStatus.value === 'pending')
async function submit() { await navigateTo({ path: '/search', query: { q: input.value.trim() || undefined } }) }
useBlogSeo(() => ({ title: q.value ? `搜索：${q.value}` : '搜索', description: '搜索博客中已公开的文章与资源。', noindex: true }))
</script>
<template>
  <div>
    <header class="page-heading"><p class="eyebrow">FOLLOW YOUR CURIOSITY</p><h1>寻找一点灵感<span class="title-dot">.</span></h1><p>在公开文章与资源中，找到你关心的内容。</p></header>
    <form class="search-form" role="search" @submit.prevent="submit"><label class="sr-only" for="global-search">搜索文章与资源</label><AppIcon name="search" /><input id="global-search" v-model="input" type="search" name="q" maxlength="200" placeholder="输入关键词，开始搜索…"><button class="button" type="submit" :disabled="!input.trim() || searching">{{ searching ? '搜索中…' : '搜索' }}</button></form>
    <ContentState v-if="!q" title="从一个关键词开始" description="输入标题或内容中的关键词，同时查找文章与资源。" />
    <div v-else id="results" class="search-results">
      <p class="search-summary" aria-live="polite">“{{ q }}” 的搜索结果</p>
      <section aria-labelledby="article-results-title" :aria-busy="articleStatus === 'pending'"><div class="section-heading"><h2 id="article-results-title">文章 <span v-if="!articleError && articleStatus !== 'pending'" class="count-label">{{ articleData?.total ?? 0 }}</span></h2></div><ContentState v-if="articleStatus === 'pending'" kind="loading" /><ContentState v-else-if="articleError" kind="error" title="文章搜索暂时不可用" description="请稍后重试。" retry @retry="refreshArticles()" /><div v-else-if="articleData?.list.length" class="article-list"><ArticleCard v-for="article in articleData.list" :key="article.id" :article="article" /></div><ContentState v-else title="没有找到相关文章" description="试试更简短的关键词。" /><PaginationNav v-if="!articleError && articleData" :total="articleData.total" :page="articlePage" :page-size="6" param="articlePage" /></section>
      <section aria-labelledby="resource-results-title" :aria-busy="resourceStatus === 'pending'"><div class="section-heading"><h2 id="resource-results-title">资源 <span v-if="!resourceError && resourceStatus !== 'pending'" class="count-label">{{ resourceData?.total ?? 0 }}</span></h2></div><ContentState v-if="resourceStatus === 'pending'" kind="loading" /><ContentState v-else-if="resourceError" kind="error" title="资源搜索暂时不可用" description="请稍后重试。" retry @retry="refreshResources()" /><div v-else-if="resourceData?.list.length" class="resource-grid"><ResourceCard v-for="resource in resourceData.list" :key="resource.id" :resource="resource" /></div><ContentState v-else title="没有找到相关资源" description="试试其他关键词。" /><PaginationNav v-if="!resourceError && resourceData" :total="resourceData.total" :page="resourcePage" :page-size="6" param="resourcePage" /></section>
    </div>
  </div>
</template>

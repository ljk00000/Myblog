<script setup lang="ts">
import type { ArticleSummary, Category, PageResult, Tag } from '#shared/types/blog'
import { formatMonth } from '#shared/utils/format'
const route = useRoute()
const page = computed(() => positiveQuery(route.query.page))
const month = computed(() => /^\d{4}-(0[1-9]|1[0-2])$/.test(textQuery(route.query.yearMonth)) ? textQuery(route.query.yearMonth) : undefined)
const query = computed(() => ({ pageNo: page.value, pageSize: 10, categoryId: optionalId(route.query.categoryId), tagId: optionalId(route.query.tagId), keyword: textQuery(route.query.keyword) || undefined, yearMonth: month.value }))
const [{ data, error, status, refresh }, { data: categories, error: categoryError, refresh: refreshCategories }, { data: tags, error: tagError, refresh: refreshTags }] = await Promise.all([
  useFetch<PageResult<ArticleSummary>>('/api/blog/article/page', { query }),
  useFetch<Category[]>('/api/blog/category/list', { query: { type: 'article' } }),
  useFetch<Tag[]>('/api/blog/tag/list'),
])
function retryFilters() { return Promise.all([refreshCategories(), refreshTags()]) }
const title = computed(() => month.value ? `${formatMonth(month.value)}的文章` : '文章')
useBlogSeo(() => ({ title: title.value, description: '浏览已公开的文章，按分类、标签或关键词查找感兴趣的内容。' }))
</script>
<template>
  <div>
    <header class="page-heading"><p class="eyebrow">WRITING</p><h1>{{ title }}</h1><p>写下思考，也留下探索的过程。</p></header>
    <FilterBar :categories="categories" :tags="tags" />
    <div v-if="categoryError || tagError" class="site-notice" role="status">部分筛选项暂时无法加载。<button class="text-button" type="button" @click="retryFilters">重试筛选</button></div>
    <section id="results" class="results-section" aria-label="文章列表" :aria-busy="status === 'pending'">
      <div class="results-heading"><span>{{ error ? '文章列表' : `共 ${data?.total ?? 0} 篇文章` }}</span><span>按置顶与发布时间排序</span></div>
      <ContentState v-if="status === 'pending'" kind="loading" />
      <ContentState v-else-if="error" kind="error" title="文章暂时无法加载" description="请稍后重新加载，或尝试其他筛选条件。" retry @retry="refresh()" />
      <div v-else-if="data?.list.length" class="article-list"><ArticleCard v-for="article in data.list" :key="article.id" :article="article" /></div>
      <ContentState v-else title="还没有符合条件的文章" description="可以调整筛选条件，或返回全部文章。"><NuxtLink to="/articles" class="text-link">查看全部文章 <AppIcon name="arrow" /></NuxtLink></ContentState>
      <PaginationNav v-if="!error && data" :total="data.total" :page="page" :page-size="10" />
    </section>
  </div>
</template>

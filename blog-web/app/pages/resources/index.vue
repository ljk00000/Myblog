<script setup lang="ts">
import type { Category, PageResult, ResourceSummary } from '#shared/types/blog'
const route = useRoute()
const page = computed(() => positiveQuery(route.query.page))
const query = computed(() => ({ pageNo: page.value, pageSize: 12, categoryId: optionalId(route.query.categoryId), keyword: textQuery(route.query.keyword) || undefined, type: ['link', 'file'].includes(textQuery(route.query.type)) ? textQuery(route.query.type) : undefined }))
const [{ data, error, status, refresh }, { data: categories, error: categoryError, refresh: refreshCategories }] = await Promise.all([
  useFetch<PageResult<ResourceSummary>>('/api/blog/resource/page', { $fetch: useBlogRequest(), query }),
  useFetch<Category[]>('/api/blog/category/list', { $fetch: useBlogRequest(), query: { type: 'resource' } }),
])
useBlogSeo(() => ({ title: '资源', description: '浏览公开的链接与文件资源，按分类、类型或关键词查找。' }))
</script>
<template>
  <div>
    <header class="page-heading"><p class="eyebrow">THE DISCOVERY SHELF</p><h1>资源<span class="title-dot">.</span></h1><p>值得留存的链接与文件，在这里慢慢整理。</p></header>
    <FilterBar :categories="categories" resource />
    <div v-if="categoryError" class="site-notice" role="status">分类暂时无法加载。<button class="text-button" type="button" @click="refreshCategories()">重试分类</button></div>
    <section id="results" class="results-section" aria-label="资源列表" :aria-busy="status === 'pending'">
      <div class="results-heading"><span>{{ error ? '资源列表' : `共 ${data?.total ?? 0} 项资源` }}</span><span>精选优先</span></div>
      <ContentState v-if="status === 'pending'" kind="loading" />
      <ContentState v-else-if="error" kind="error" title="资源暂时无法加载" description="请稍后重新加载，或尝试其他筛选条件。" retry @retry="refresh()" />
      <div v-else-if="data?.list.length" class="resource-grid"><ResourceCard v-for="resource in data.list" :key="resource.id" :resource="resource" /></div>
      <ContentState v-else title="还没有符合条件的资源" description="可以调整筛选条件，或返回全部资源。"><NuxtLink to="/resources" class="text-link">查看全部资源 <AppIcon name="arrow" /></NuxtLink></ContentState>
      <PaginationNav v-if="!error && data" :total="data.total" :page="page" :page-size="12" />
    </section>
  </div>
</template>

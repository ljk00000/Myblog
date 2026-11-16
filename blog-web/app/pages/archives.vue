<script setup lang="ts">
import type { ArchiveMonth } from '#shared/types/blog'
import { formatMonth } from '#shared/utils/format'
const { data, error, status, refresh } = await useFetch<ArchiveMonth[]>('/api/blog/article/archives', { $fetch: useBlogRequest() })
const years = computed(() => {
  const groups = new Map<string, ArchiveMonth[]>()
  for (const item of data.value || []) {
    const year = item.yearMonth.slice(0, 4)
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(item)
  }
  return [...groups].sort(([a], [b]) => b.localeCompare(a))
})
useBlogSeo(() => ({ title: '归档', description: '沿着时间线，浏览每个月公开发布的文章。' }))
</script>
<template>
  <div class="narrow-page">
    <header class="page-heading"><h1>归档</h1><p>按发布时间查看文章。</p></header>
    <ContentState v-if="status === 'pending'" kind="loading" />
    <ContentState v-else-if="error" kind="error" title="归档暂时无法加载" description="请稍后再试。" retry @retry="refresh()" />
    <div v-else-if="years.length" class="archive-timeline"><section v-for="[year, months] in years" :key="year" class="archive-year"><h2>{{ year }}<span>年</span></h2><ul><li v-for="month in months" :key="month.yearMonth"><NuxtLink :to="{ path: '/articles', query: { yearMonth: month.yearMonth } }"><span>{{ formatMonth(month.yearMonth) }}</span><span class="archive-count">{{ month.total }} 篇文章 <AppIcon name="arrow" /></span></NuxtLink></li></ul></section></div>
    <ContentState v-else title="暂无归档" description="还没有公开文章。" />
  </div>
</template>

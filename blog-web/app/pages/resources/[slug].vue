<script setup lang="ts">
import type { Resource } from '#shared/types/blog'
import { formatDate, isoDate, plainText, safeUrl } from '#shared/utils/format'
definePageMeta({ key: route => route.path, validate: route => typeof route.params.slug === 'string' && /^[a-z0-9-]{1,120}$/.test(route.params.slug) })
const route = useRoute()
const { data: resource, error } = await useFetch<Resource>('/api/blog/resource/get', { query: { slug: route.params.slug } })
if (error.value || !resource.value) {
  const statusCode = error.value?.statusCode || 404
  throw createError({ statusCode, fatal: true, message: statusCode === 404 ? '这项资源不存在或尚未公开' : '资源暂时无法加载，请稍后重试' })
}
useBlogSeo(() => ({ title: resource.value?.seoTitle || resource.value?.title || '资源', description: resource.value?.seoDescription || resource.value?.summary || plainText(resource.value?.contentHtml), image: resource.value?.coverUrl }))
</script>
<template>
  <article v-if="resource" class="detail-page">
    <nav class="breadcrumbs" aria-label="当前位置"><NuxtLink to="/">首页</NuxtLink><span aria-hidden="true">/</span><NuxtLink to="/resources">资源</NuxtLink></nav>
    <header class="detail-heading"><div class="card-meta"><span class="category-label">{{ resource.type === 'file' ? '文件资源' : '链接资源' }}</span><NuxtLink v-if="resource.categoryId && resource.categoryName" :to="{ path: '/resources', query: { categoryId: resource.categoryId } }">{{ resource.categoryName }}</NuxtLink><span v-if="resource.featured" class="badge">精选</span></div><h1>{{ resource.title }}</h1><p v-if="resource.summary" class="detail-summary">{{ resource.summary }}</p><time v-if="isoDate(resource.publishTime)" class="detail-meta" :datetime="isoDate(resource.publishTime)">{{ formatDate(resource.publishTime) }}</time></header>
    <div class="resource-destination"><div><p class="eyebrow">{{ resource.type === 'file' ? '文件地址' : '资源地址' }}</p><p class="destination-url">{{ safeUrl(resource.url) ? resource.url : '此资源暂未提供有效地址' }}</p></div><a v-if="safeUrl(resource.url)" class="button" :href="safeUrl(resource.url)" target="_blank" rel="noopener noreferrer">{{ resource.type === 'file' ? '打开文件' : '访问资源' }}<AppIcon name="external" /><span class="sr-only">（在新窗口打开）</span></a><span v-else class="button disabled" aria-disabled="true">暂不可访问</span></div>
    <img v-if="safeUrl(resource.coverUrl)" class="detail-cover" :src="safeUrl(resource.coverUrl)" :alt="resource.title" width="1120" height="560">
    <div class="reading-layout" :class="{ 'has-toc': resource.toc?.length }"><TocList :entries="resource.toc || []" /><div class="reading-column"><ContentBody v-if="resource.contentHtml" :html="resource.contentHtml" /><ContentState v-else title="暂无更多说明" description="可通过上方地址打开资源。" /><div class="article-end"><NuxtLink class="text-link" to="/resources">← 返回资源列表</NuxtLink></div></div></div>
  </article>
</template>

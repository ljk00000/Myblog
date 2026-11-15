<script setup lang="ts">
import type { Article } from '#shared/types/blog'
import { formatDate, isoDate, plainText, safeUrl } from '#shared/utils/format'
definePageMeta({ key: route => route.path, validate: route => typeof route.params.slug === 'string' && /^[a-z0-9-]{1,120}$/.test(route.params.slug) })
const route = useRoute()
const { data: article, error } = await useFetch<Article>('/api/blog/article/get', { query: { slug: route.params.slug } })
if (error.value || !article.value) {
  const statusCode = error.value?.statusCode || 404
  throw createError({ statusCode, fatal: true, message: statusCode === 404 ? '这篇文章不存在或尚未公开' : '文章暂时无法加载，请稍后重试' })
}
useBlogSeo(() => ({ title: article.value?.seoTitle || article.value?.title || '文章', description: article.value?.seoDescription || article.value?.summary || plainText(article.value?.contentHtml), image: article.value?.coverUrl, type: 'article' }))
</script>
<template>
  <article v-if="article" class="detail-page">
    <nav class="breadcrumbs" aria-label="当前位置"><NuxtLink to="/">首页</NuxtLink><span aria-hidden="true">/</span><NuxtLink to="/articles">文章</NuxtLink></nav>
    <header class="detail-heading">
      <div class="card-meta"><NuxtLink v-if="article.categoryId && article.categoryName" :to="{ path: '/articles', query: { categoryId: article.categoryId } }" class="category-label">{{ article.categoryName }}</NuxtLink><span v-if="article.pinned" class="badge">置顶</span></div>
      <h1>{{ article.title }}</h1>
      <p v-if="article.summary" class="detail-summary">{{ article.summary }}</p>
      <div class="detail-meta"><time v-if="isoDate(article.publishTime)" :datetime="isoDate(article.publishTime)">{{ formatDate(article.publishTime) }}</time><span v-if="article.readingMinutes > 0">{{ article.readingMinutes }} 分钟阅读</span></div>
      <div v-if="article.tags?.length" class="tag-list"><NuxtLink v-for="tag in article.tags" :key="tag.id" :to="{ path: '/articles', query: { tagId: tag.id } }"># {{ tag.name }}</NuxtLink></div>
    </header>
    <img v-if="safeUrl(article.coverUrl)" class="detail-cover" :src="safeUrl(article.coverUrl)" :alt="article.title" width="1120" height="560" fetchpriority="high">
    <div class="reading-layout" :class="{ 'has-toc': article.toc?.length }"><TocList :entries="article.toc || []" /><div class="reading-column"><ContentBody v-if="article.contentHtml" :html="article.contentHtml" /><ContentState v-else title="正文尚未填写" description="这篇文章暂时只有摘要。" /><div class="article-end"><span aria-hidden="true">—</span><p>感谢阅读</p><NuxtLink class="text-link" to="/articles">← 返回文章列表</NuxtLink></div></div></div>
  </article>
</template>

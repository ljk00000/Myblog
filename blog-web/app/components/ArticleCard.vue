<script setup lang="ts">
import type { ArticleSummary } from '#shared/types/blog'
import { formatDate, isoDate, safeUrl } from '#shared/utils/format'
defineProps<{ article: ArticleSummary }>()
</script>
<template>
  <article class="article-card spotlight">
    <div class="card-body">
      <div class="card-meta"><NuxtLink v-if="article.categoryId && article.categoryName" :to="{ path: '/articles', query: { categoryId: article.categoryId } }" class="category-label">{{ article.categoryName }}</NuxtLink><span v-if="article.pinned" class="badge">置顶</span><time v-if="isoDate(article.publishTime)" :datetime="isoDate(article.publishTime)">{{ formatDate(article.publishTime) }}</time></div>
      <h3><NuxtLink :to="`/articles/${article.slug}`">{{ article.title }}</NuxtLink></h3>
      <p v-if="article.summary" class="card-summary">{{ article.summary }}</p>
      <div class="card-bottom"><div class="tag-list"><NuxtLink v-for="tag in article.tags || []" :key="tag.id" :to="{ path: '/articles', query: { tagId: tag.id } }"># {{ tag.name }}</NuxtLink></div><span v-if="article.readingMinutes > 0" class="reading-time">{{ article.readingMinutes }} 分钟阅读</span></div>
    </div>
    <NuxtLink v-if="safeUrl(article.coverUrl)" :to="`/articles/${article.slug}`" class="card-cover" tabindex="-1" aria-hidden="true"><img :src="safeUrl(article.coverUrl)" alt="" loading="lazy" width="240" height="170"></NuxtLink>
    <span v-if="!safeUrl(article.coverUrl)" class="card-arrow" aria-hidden="true"><AppIcon name="arrow" /></span>
  </article>
</template>

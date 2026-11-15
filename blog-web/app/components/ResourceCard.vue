<script setup lang="ts">
import type { ResourceSummary } from '#shared/types/blog'
import { safeUrl } from '#shared/utils/format'
defineProps<{ resource: ResourceSummary }>()
</script>
<template>
  <article class="resource-card spotlight">
    <img v-if="safeUrl(resource.coverUrl)" class="resource-cover" :src="safeUrl(resource.coverUrl)" alt="" width="480" height="240" loading="lazy">
    <div class="resource-card-inner">
      <div class="resource-top"><span class="resource-icon"><AppIcon :name="resource.type === 'file' ? 'file' : 'external'" /></span><span class="eyebrow">{{ resource.type === 'file' ? '文件资源' : '链接资源' }}</span><span v-if="resource.featured" class="badge">精选</span></div>
      <h3><NuxtLink :to="`/resources/${resource.slug}`">{{ resource.title }}</NuxtLink></h3>
      <p v-if="resource.summary" class="card-summary">{{ resource.summary }}</p>
      <div class="resource-bottom"><NuxtLink v-if="resource.categoryId && resource.categoryName" :to="{ path: '/resources', query: { categoryId: resource.categoryId } }" class="category-label">{{ resource.categoryName }}</NuxtLink><NuxtLink :to="`/resources/${resource.slug}`" class="text-link" :aria-label="`查看资源：${resource.title}`">查看资源 <AppIcon name="arrow" /></NuxtLink></div>
    </div>
  </article>
</template>

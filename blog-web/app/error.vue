<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const missing = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: () => missing.value ? '内容未找到 · Myblog' : '暂时无法访问 · Myblog', description: () => missing.value ? '内容不存在、已下架或尚未公开。' : '博客服务暂时不可用，请稍后重试。', robots: 'noindex, follow' })
function retry() { window.location.reload() }
</script>
<template>
  <main class="error-page"><div><div class="error-orbit" aria-hidden="true">{{ error.statusCode || 500 }}</div><p class="error-code">{{ missing ? 'LOST BETWEEN THE LINES' : 'A BRIEF PAUSE' }}</p><h1>{{ missing ? '这一页，暂时找不到了' : '暂时无法打开这一页' }}</h1><p>{{ missing ? '内容可能尚未公开、已经下架，或链接有误。你可以回到首页，继续阅读其他内容。' : '博客服务暂时没有响应。请稍后重试，或回到首页。' }}</p><div class="error-actions"><a class="button" href="/">返回首页 <AppIcon name="arrow" /></a><button v-if="!missing" type="button" class="button button-secondary" @click="retry">重新加载</button><a v-else class="button button-secondary" href="/search">搜索内容</a></div></div></main>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const missing = computed(() => props.error.statusCode === 404)
useSeoMeta({ title: () => missing.value ? '内容未找到 · Myblog' : '暂时无法访问 · Myblog', description: () => missing.value ? '内容不存在、已下架或尚未公开。' : '博客服务暂时不可用，请稍后重试。', robots: 'noindex, follow' })
function retry() { window.location.reload() }
</script>
<template>
  <main class="error-page"><div><p class="error-code">{{ error.statusCode || 500 }}</p><h1>{{ missing ? '页面不存在' : '页面加载失败' }}</h1><p>{{ missing ? '内容不存在、已下架或尚未公开，请检查链接。' : '服务暂时不可用，请稍后重试。' }}</p><div class="error-actions"><a class="button" href="/">返回首页</a><button v-if="!missing" type="button" class="button button-secondary" @click="retry">重新加载</button><a v-else class="button button-secondary" href="/search">搜索内容</a></div></div></main>
</template>

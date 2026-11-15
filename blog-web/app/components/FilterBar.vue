<script setup lang="ts">
import type { Category, Tag } from '#shared/types/blog'
const props = defineProps<{ categories?: Category[] | null; tags?: Tag[] | null; resource?: boolean }>()
const route = useRoute()
const keyword = ref(textQuery(route.query.keyword))
watch(() => route.query.keyword, value => { keyword.value = textQuery(value) })
function filter(key: string, value?: string | number) {
  return { path: route.path, query: { ...route.query, [key]: value === undefined ? undefined : String(value), page: undefined }, hash: '#results' }
}
async function submit() { await navigateTo(filter('keyword', keyword.value.trim() || undefined)) }
const hasFilter = computed(() => ['categoryId', 'tagId', 'type', 'keyword', 'yearMonth'].some(key => route.query[key]))
</script>
<template>
  <div class="filter-panel">
    <div class="filter-top"><span class="eyebrow">筛选{{ resource ? '资源' : '文章' }}</span><form class="inline-search" role="search" @submit.prevent="submit"><label class="sr-only" for="list-keyword">按关键词筛选</label><input id="list-keyword" v-model="keyword" name="keyword" type="search" maxlength="200" placeholder="输入关键词…"><button type="submit" class="icon-button" aria-label="按关键词筛选"><AppIcon name="search" /></button></form></div>
    <div v-if="categories?.length" class="filter-row"><span class="filter-label">分类</span><div class="chips"><NuxtLink :to="filter('categoryId')" class="chip" :class="{ selected: !route.query.categoryId }" :aria-current="!route.query.categoryId ? 'true' : undefined">全部</NuxtLink><NuxtLink v-for="category in categories" :key="category.id" :to="filter('categoryId', category.id)" class="chip" :class="{ selected: String(route.query.categoryId) === String(category.id) }" :aria-current="String(route.query.categoryId) === String(category.id) ? 'true' : undefined">{{ category.name }}</NuxtLink></div></div>
    <div v-if="!props.resource && tags?.length" class="filter-row"><span class="filter-label">标签</span><div class="chips"><NuxtLink :to="filter('tagId')" class="chip" :class="{ selected: !route.query.tagId }" :aria-current="!route.query.tagId ? 'true' : undefined">全部</NuxtLink><NuxtLink v-for="tag in tags" :key="tag.id" :to="filter('tagId', tag.id)" class="chip" :class="{ selected: String(route.query.tagId) === String(tag.id) }" :aria-current="String(route.query.tagId) === String(tag.id) ? 'true' : undefined">{{ tag.name }}</NuxtLink></div></div>
    <div v-if="resource" class="filter-row"><span class="filter-label">类型</span><div class="chips"><NuxtLink v-for="item in [{ value: undefined, label: '全部' }, { value: 'link', label: '链接' }, { value: 'file', label: '文件' }]" :key="item.label" :to="filter('type', item.value)" class="chip" :class="{ selected: route.query.type === item.value }" :aria-current="route.query.type === item.value ? 'true' : undefined">{{ item.label }}</NuxtLink></div></div>
    <NuxtLink v-if="hasFilter" :to="route.path" class="clear-filter">清除所有筛选 ×</NuxtLink>
  </div>
</template>

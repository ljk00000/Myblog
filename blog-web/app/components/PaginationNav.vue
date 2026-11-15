<script setup lang="ts">
const props = withDefaults(defineProps<{ total: number; page: number; pageSize: number; param?: string }>(), { param: 'page' })
const route = useRoute()
const pages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const visible = computed(() => [...new Set([1, ...Array.from({ length: 5 }, (_, n) => props.page - 2 + n), pages.value])].filter(p => p >= 1 && p <= pages.value).sort((a, b) => a - b))
function link(page: number) { return { path: route.path, query: { ...route.query, [props.param]: page === 1 ? undefined : String(page) }, hash: '#results' } }
</script>
<template>
  <nav v-if="total > pageSize || page > 1" class="pagination" aria-label="结果分页">
    <NuxtLink v-if="page > 1" :to="link(page - 1)" class="page-step">← 上一页</NuxtLink><span v-else class="page-step disabled" aria-disabled="true">← 上一页</span>
    <div class="page-numbers"><template v-for="(p, i) in visible" :key="p"><span v-if="i > 0 && p - visible[i - 1]! > 1" class="page-gap">…</span><NuxtLink :to="link(p)" :class="{ selected: page === p }" :aria-current="page === p ? 'page' : undefined" :aria-label="`第 ${p} 页`">{{ p }}</NuxtLink></template></div>
    <NuxtLink v-if="page < pages" :to="link(page + 1)" class="page-step">下一页 →</NuxtLink><span v-else class="page-step disabled" aria-disabled="true">下一页 →</span>
    <span class="sr-only">共 {{ total }} 项，第 {{ page }} 页</span>
  </nav>
</template>

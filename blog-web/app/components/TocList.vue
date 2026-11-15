<script setup lang="ts">
import type { TocEntry } from '#shared/types/blog'
defineProps<{ entries: TocEntry[] }>()
</script>
<template>
  <aside v-if="entries?.length" class="toc">
    <details open><summary>本页目录</summary><nav aria-label="正文目录"><a v-for="entry in entries" :key="entry.id" :href="`#${encodeURIComponent(entry.id)}`" :style="{ paddingInlineStart: `${Math.min(Math.max(entry.level - 1, 0), 4) * 12 + 12}px` }">{{ entry.text }}</a></nav></details>
  </aside>
</template>

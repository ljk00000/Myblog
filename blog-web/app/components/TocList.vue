<script setup lang="ts">
import type { TocEntry } from '#shared/types/blog'
const props = defineProps<{ entries: TocEntry[] }>()
const active = ref('')
let observer: IntersectionObserver | undefined
function observe() {
  observer?.disconnect()
  active.value = props.entries[0]?.id || ''
  if (!('IntersectionObserver' in window)) return
  const visible = new Set<string>()
  observer = new IntersectionObserver(changes => {
    for (const entry of changes) {
      if (entry.isIntersecting) visible.add(entry.target.id)
      else visible.delete(entry.target.id)
    }
    const first = props.entries.find(entry => visible.has(entry.id))
    if (first) active.value = first.id
  }, { rootMargin: '-128px 0px -15% 0px', threshold: 0 })
  for (const entry of props.entries) {
    const heading = document.getElementById(entry.id)
    if (heading) observer.observe(heading)
  }
}
onMounted(observe)
watch(() => props.entries, () => nextTick(observe))
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <aside v-if="entries?.length" class="toc">
    <details open><summary>本页目录</summary><nav aria-label="正文目录"><a v-for="entry in entries" :key="entry.id" :href="`#${encodeURIComponent(entry.id)}`" :class="{ active: active === entry.id }" :aria-current="active === entry.id ? 'location' : undefined" :style="{ paddingInlineStart: `${Math.min(Math.max(entry.level - 1, 0), 4) * 12 + 12}px` }" @click="active = entry.id">{{ entry.text }}</a></nav></details>
  </aside>
</template>

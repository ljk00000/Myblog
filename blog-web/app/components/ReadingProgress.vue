<script setup lang="ts">
const progress = ref(0)
const reduced = ref(false)
let frame = 0
let media: MediaQueryList | undefined
function update() {
  frame = 0
  const article = document.querySelector<HTMLElement>('.detail-page')
  if (!article) return
  const top = article.getBoundingClientRect().top + window.scrollY
  const length = article.offsetHeight - window.innerHeight + 96
  progress.value = length > 0 ? Math.min(1, Math.max(0, (window.scrollY - top + 96) / length)) : 1
}
function schedule() { if (!frame) frame = requestAnimationFrame(update) }
function configure() {
  reduced.value = media?.matches ?? false
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  cancelAnimationFrame(frame)
  frame = 0
  if (!reduced.value) {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    update()
  }
}
onMounted(() => {
  media = window.matchMedia('(prefers-reduced-motion: reduce)')
  media.addEventListener('change', configure)
  configure()
})
onBeforeUnmount(() => {
  cancelAnimationFrame(frame)
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
  media?.removeEventListener('change', configure)
})
</script>
<template><div v-if="!reduced" class="reading-progress" :style="{ transform: `scaleX(${progress})` }" aria-hidden="true" /></template>

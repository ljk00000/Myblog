<script setup lang="ts">
const props = defineProps<{ html: string }>()
const root = ref<HTMLElement>()
const announcement = ref('')
const timers = new Set<ReturnType<typeof setTimeout>>()
function enhance() {
  if (!root.value) return
  root.value.querySelectorAll('pre').forEach(pre => {
    if (!pre.querySelector('code') || pre.querySelector('.copy-code')) return
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'copy-code'
    button.textContent = '复制代码'
    button.setAttribute('aria-label', '复制此代码块')
    pre.prepend(button)
    pre.tabIndex = 0
    pre.setAttribute('aria-label', '代码块，可横向滚动')
  })
  root.value.querySelectorAll('img').forEach(image => { image.loading = 'lazy'; image.decoding = 'async' })
  root.value.querySelectorAll('a[target="_blank"]').forEach(link => { link.setAttribute('rel', 'noopener noreferrer') })
}
async function copy(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof HTMLButtonElement) || !target.classList.contains('copy-code')) return
  const text = target.parentElement?.querySelector('code')?.textContent
  if (!text) return
  target.disabled = true
  try {
    await navigator.clipboard.writeText(text)
    target.textContent = '已复制'
    announcement.value = '代码已复制到剪贴板'
  } catch {
    target.textContent = '复制失败'
    announcement.value = '浏览器不允许复制，请选中代码手动复制'
  } finally {
    const timer = setTimeout(() => { target.textContent = '复制代码'; target.disabled = false; timers.delete(timer) }, 2200)
    timers.add(timer)
  }
}
onMounted(enhance)
watch(() => props.html, () => nextTick(enhance))
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>
<template>
  <div class="content-body">
    <!-- Java CommonMark + Jsoup owns sanitization; Markdown is never rendered here. -->
    <div ref="root" class="prose" @click="copy" v-html="html" />
    <p class="sr-only" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

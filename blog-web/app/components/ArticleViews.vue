<script setup lang="ts">
const props = defineProps<{ slug: string }>()
const config = useRuntimeConfig()
const badgeUrl = ref('')
const loaded = ref(false)

onMounted(() => {
  if (!config.public.articleViewsSite) return
  const site = new URL(config.public.articleViewsSite)
  if (window.location.origin !== site.origin) return

  // Count against the canonical article path, independent of query or trailing slash.
  const path = `${config.app.baseURL}articles/${encodeURIComponent(props.slug)}`
  const badge = new URL(`https://hits.sh/${site.host}${path}.svg`)
  badge.search = new URLSearchParams({ label: '浏览量', color: '414754', labelColor: '24282e' }).toString()
  badgeUrl.value = badge.href
})
</script>

<template>
  <img
    v-if="badgeUrl"
    v-show="loaded"
    class="article-views"
    :src="badgeUrl"
    alt="文章浏览量"
    height="20"
    referrerpolicy="no-referrer"
    @load="loaded = true"
    @error="badgeUrl = ''"
  >
</template>

<style scoped>
.article-views { height: 20px; width: auto; }
</style>

<script setup lang="ts">
import { safeUrl, safeEmail } from '#shared/utils/format'
const { data: site, error, refresh, status } = await useSite()
const route = useRoute()
const menuOpen = ref(false)
const menuButton = ref<HTMLButtonElement>()
const nav = [ ['/', '首页'], ['/articles', '文章'], ['/resources', '资源'], ['/archives', '归档'], ['/about', '关于'] ]
const current = (path: string) => path === '/' ? route.path === '/' : route.path.startsWith(path)
watch(() => route.fullPath, () => { menuOpen.value = false; void refresh() })
function closeMenu() { if (menuOpen.value) { menuOpen.value = false; menuButton.value?.focus() } }
useAmbientMotion()
</script>

<template>
  <div class="site-shell" @keydown.esc="closeMenu">
    <div class="ambient-canvas" aria-hidden="true"><div class="ambient-glow" /></div>
    <a class="skip-link" href="#main-content">跳转到正文</a>
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand" aria-label="返回首页"><span class="brand-mark" aria-hidden="true"><svg class="brand-symbol" viewBox="0 0 32 32" fill="none"><path d="m5 22 3-14 8 5 8-5 3 14-11 4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" /><path d="m8 8 8 18 8-18M5 22l11-9 11 9" stroke="currentColor" stroke-width="1.2" opacity=".45" /><path d="m16 4 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="#c8b5ff" /></svg></span><span class="brand-name">{{ site?.title || 'Myblog' }}</span></NuxtLink>
        <div class="header-actions">
          <nav class="desktop-nav" aria-label="主导航"><NuxtLink v-for="[path, label] in nav" :key="path" :to="path!" :class="{ current: current(path!) }" :aria-current="current(path!) ? 'page' : undefined">{{ label }}</NuxtLink></nav>
          <div class="header-search"><NuxtLink to="/search" class="icon-button" :class="{ current: route.path === '/search' }" aria-label="搜索文章和资源"><AppIcon name="search" /></NuxtLink></div>
          <button ref="menuButton" class="icon-button mobile-toggle" type="button" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? '收起导航' : '展开导航'" @click="menuOpen = !menuOpen"><AppIcon :name="menuOpen ? 'close' : 'menu'" /></button>
        </div>
      </div>
      <nav v-if="menuOpen" id="mobile-nav" class="mobile-nav container" aria-label="移动导航"><NuxtLink v-for="[path, label] in nav" :key="path" :to="path!" :class="{ current: current(path!) }" :aria-current="current(path!) ? 'page' : undefined">{{ label }}</NuxtLink></nav>
    </header>
    <div v-if="error" class="container"><div class="site-notice" role="status"><span>站点信息暂时无法加载。</span><button class="text-button" type="button" :disabled="status === 'pending'" @click="refresh()">{{ status === 'pending' ? '正在重试…' : '重试' }}</button></div></div>
    <main id="main-content" class="container main-content" tabindex="-1"><slot /></main>
    <footer class="site-footer">
      <div class="container footer-inner">
        <div><NuxtLink to="/" class="footer-title"><span class="footer-star" aria-hidden="true">✦</span>{{ site?.title || 'Myblog' }}</NuxtLink><p v-if="site?.footerText">{{ site.footerText }}</p><p v-else-if="site?.subtitle">{{ site.subtitle }}</p></div>
        <nav aria-label="页脚导航" class="footer-links">
          <a v-if="safeUrl(site?.githubUrl, false)" :href="safeUrl(site?.githubUrl, false)" target="_blank" rel="noopener noreferrer">GitHub <AppIcon name="external" /></a>
          <a v-if="safeEmail(site?.email)" :href="safeEmail(site?.email)">联系作者</a>
          <NuxtLink to="/about">关于这里</NuxtLink><a href="#main-content">回到顶部 <span aria-hidden="true">↑</span></a>
        </nav>
      </div>
    </footer>
  </div>
</template>

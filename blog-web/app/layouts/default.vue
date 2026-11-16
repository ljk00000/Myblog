<script setup lang="ts">
import { safeUrl, safeEmail } from '#shared/utils/format'
const { data: site, error, refresh, status } = await useSite()
const route = useRoute()
const menuOpen = ref(false)
const { configured: loginEnabled, user: owner, initialize: initializeLogin } = useOwnerAuth()
onMounted(() => { void initializeLogin() })
const menuButton = ref<HTMLButtonElement>()
const nav = [ ['/', '首页'], ['/articles', '文章'], ['/resources', '资源'], ['/archives', '归档'], ['/tech-stack', '技术栈'], ['/about', '关于'] ]
const current = (path: string) => path === '/' ? route.path === '/' : route.path.startsWith(path)
watch(() => route.fullPath, () => { menuOpen.value = false; void refresh() })
function closeMenu() { if (menuOpen.value) { menuOpen.value = false; menuButton.value?.focus() } }
</script>

<template>
  <div class="site-shell" @keydown.esc="closeMenu">
    <a class="skip-link" href="#main-content">跳转到正文</a>
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand" aria-label="返回首页">{{ site?.title || 'Myblog' }}</NuxtLink>
        <div class="header-actions">
          <nav class="desktop-nav" aria-label="主导航"><NuxtLink v-for="[path, label] in nav" :key="path" :to="path!" :class="{ current: current(path!) }" :aria-current="current(path!) ? 'page' : undefined">{{ label }}</NuxtLink></nav>
          <NuxtLink to="/search" class="icon-button" :class="{ current: route.path === '/search' }" aria-label="搜索文章和资源"><AppIcon name="search" /></NuxtLink>
          <NuxtLink v-if="loginEnabled" to="/login" class="owner-login-link" :class="{ current: route.path === '/login' }" :aria-label="owner ? '站长账号' : '站长登录'">{{ owner ? '站长' : '登录' }}</NuxtLink>
          <button ref="menuButton" class="icon-button mobile-toggle" type="button" :aria-expanded="menuOpen" aria-controls="mobile-nav" :aria-label="menuOpen ? '收起导航' : '展开导航'" @click="menuOpen = !menuOpen"><AppIcon :name="menuOpen ? 'close' : 'menu'" /></button>
        </div>
      </div>
      <nav v-if="menuOpen" id="mobile-nav" class="mobile-nav container" aria-label="移动导航"><NuxtLink v-for="[path, label] in nav" :key="path" :to="path!" :class="{ current: current(path!) }" :aria-current="current(path!) ? 'page' : undefined">{{ label }}</NuxtLink></nav>
    </header>
    <div v-if="error" class="container"><div class="site-notice" role="status"><span>站点信息暂时无法加载。</span><button class="text-button" type="button" :disabled="status === 'pending'" @click="refresh()">{{ status === 'pending' ? '正在重试…' : '重试' }}</button></div></div>
    <main id="main-content" class="container main-content" tabindex="-1"><slot /></main>
    <footer class="site-footer">
      <div class="container footer-inner">
        <div><NuxtLink to="/" class="footer-title">{{ site?.title || 'Myblog' }}</NuxtLink><p v-if="site?.footerText">{{ site.footerText }}</p></div>
        <nav aria-label="页脚导航" class="footer-links">
          <a v-if="safeUrl(site?.githubUrl, false)" :href="safeUrl(site?.githubUrl, false)" target="_blank" rel="noopener noreferrer">GitHub <AppIcon name="external" /></a>
          <a v-if="safeEmail(site?.email)" :href="safeEmail(site?.email)">联系作者</a>
          <NuxtLink to="/about">关于</NuxtLink><a href="#main-content">回到顶部 ↑</a>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.owner-login-link { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding-inline: 8px; font-size: 14px; color: var(--muted); border-radius: var(--radius); }
.owner-login-link:hover, .owner-login-link.current { color: var(--ink); background: var(--surface); }
</style>

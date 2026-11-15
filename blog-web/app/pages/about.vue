<script setup lang="ts">
import type { Site } from '#shared/types/blog'
import { plainText, safeUrl, safeEmail } from '#shared/utils/format'
const { data: site } = useNuxtData<Site>('blog-site')
useBlogSeo(() => ({ title: '关于', description: plainText(site.value?.aboutHtml) || site.value?.description || '关于这个博客和作者。', image: site.value?.avatarUrl }))
</script>
<template>
  <div class="narrow-page about-page">
    <header class="page-heading"><p class="eyebrow">BEHIND THE WORDS</p><h1>关于这里<span class="title-dot">.</span></h1><p v-if="site?.subtitle">{{ site.subtitle }}</p></header>
    <div v-if="site && (site.authorName || site.description || safeUrl(site.avatarUrl) || safeUrl(site.githubUrl, false) || safeEmail(site.email))" class="author-card reveal"><img v-if="safeUrl(site.avatarUrl)" :src="safeUrl(site.avatarUrl)" :alt="site.authorName" class="avatar" width="72" height="72"><span v-else class="avatar author-monogram" aria-hidden="true">{{ site.authorName?.slice(0, 1) || '✦' }}</span><div><p v-if="site.authorName" class="author-name">{{ site.authorName }}</p><p v-if="site.description" class="muted">{{ site.description }}</p><div v-if="safeUrl(site.githubUrl, false) || safeEmail(site.email)" class="author-links"><a v-if="safeUrl(site.githubUrl, false)" :href="safeUrl(site.githubUrl, false)" target="_blank" rel="noopener noreferrer" class="text-link">GitHub <AppIcon name="external" /></a><a v-if="safeEmail(site.email)" :href="safeEmail(site.email)" class="text-link">联系作者 <AppIcon name="arrow" /></a></div></div></div>
    <ContentBody v-if="site?.aboutHtml" :html="site.aboutHtml" />
    <ContentState v-else-if="site" title="关于的文字，待续" description="作者还没有填写更多介绍。可以先看看文章和资源。"><NuxtLink to="/articles" class="text-link">去读文章 <AppIcon name="arrow" /></NuxtLink></ContentState>
    <ContentState v-else kind="error" title="站点介绍暂时无法加载" description="请通过页面上方的重试按钮重新加载站点信息。" />
  </div>
</template>

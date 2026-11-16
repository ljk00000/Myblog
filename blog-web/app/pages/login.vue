<script setup lang="ts">
const { configured, user, initialized, busy, error, signIn, signOut } = useOwnerAuth()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const accountHeading = ref<HTMLHeadingElement>()
const passwordInput = ref<HTMLInputElement>()
useBlogSeo(() => ({ title: '站长登录', description: '博客站长登录。文章、资源和搜索无需登录。', noindex: true }))

async function submit() {
  if (await signIn(email.value.trim(), password.value)) {
    password.value = ''
    showPassword.value = false
    await nextTick()
    accountHeading.value?.focus()
  } else {
    password.value = ''
    passwordInput.value?.focus()
  }
}
</script>

<template>
  <section class="login-page" aria-labelledby="login-title">
    <header class="page-heading"><h1 id="login-title">站长登录</h1><p>文章、资源和搜索无需登录。</p></header>
    <div v-if="!configured" class="login-panel">
      <h2>登录暂未启用</h2><p class="muted">站长登录服务尚未配置。你可以继续浏览博客。</p>
      <NuxtLink class="button button-secondary" to="/">返回首页</NuxtLink>
    </div>
    <div v-else-if="!initialized" class="login-panel" role="status"><p class="muted">正在检查登录状态…</p></div>
    <div v-else-if="user" class="login-panel">
      <h2 ref="accountHeading" tabindex="-1">已以站长身份登录</h2>
      <p class="owner-email">{{ user.email }}</p><p class="muted">当前登录仅用于博客站长身份，内容管理仍使用管理后台。</p>
      <p v-if="error" class="login-error" role="alert">{{ error }}</p>
      <div class="login-actions"><NuxtLink class="button button-secondary" to="/">返回博客</NuxtLink><button class="button" type="button" :disabled="busy" @click="signOut">{{ busy ? '正在退出…' : '退出登录' }}</button></div>
    </div>
    <form v-else class="login-panel login-form" :aria-busy="busy" @submit.prevent="submit">
      <p class="muted">仅供站长使用，不开放注册。</p>
      <div class="login-field"><label for="owner-email">邮箱</label><input id="owner-email" v-model="email" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254" required :disabled="busy"></div>
      <div class="login-field"><label for="owner-password">密码</label><div class="password-control"><input id="owner-password" ref="passwordInput" v-model="password" name="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" maxlength="256" required :disabled="busy" :aria-describedby="error ? 'login-error' : undefined"><button class="password-toggle" type="button" :aria-pressed="showPassword" aria-controls="owner-password" :disabled="busy" @click="showPassword = !showPassword">{{ showPassword ? '隐藏' : '显示' }}</button></div></div>
      <p v-if="error" id="login-error" class="login-error" role="alert">{{ error }}</p>
      <button class="button login-submit" type="submit" :disabled="busy">{{ busy ? '正在登录…' : '登录' }}</button>
      <p class="login-note muted">登录状态保留在当前标签页，不保存密码。</p>
    </form>
    <noscript><p class="login-error">登录需要启用 JavaScript；公开内容仍可直接阅读。</p></noscript>
  </section>
</template>

<style scoped>
.login-page { width: min(100%, 440px); margin-inline: auto; }
.login-panel { padding: 24px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--surface); display: grid; gap: 20px; }
.login-panel h2 { font-size: 20px; }
.login-panel p { font-size: 14px; }
.login-field { display: grid; gap: 8px; min-width: 0; }
.login-field label { font-size: 14px; font-weight: 500; }
.login-field input { width: 100%; min-height: 44px; padding: 10px 12px; background: var(--bg); font-size: 16px; }
.password-control { position: relative; }
.password-control input { padding-right: 64px; }
.password-toggle { position: absolute; top: 1px; right: 1px; min-height: 44px; padding: 8px 12px; border: 0; background: transparent; color: var(--accent); border-radius: var(--radius); font-size: 14px; }
.login-error { color: var(--danger); }
.login-actions { display: flex; flex-wrap: wrap; gap: 12px; }
.login-submit { width: 100%; }
.owner-email { overflow-wrap: anywhere; }
.login-panel .login-note { font-size: 12px; }
</style>

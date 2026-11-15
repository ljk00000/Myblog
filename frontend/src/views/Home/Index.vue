<template>
  <div class="workbench">
    <el-card shadow="never">
      <div class="welcome">
        <el-avatar :src="avatar" :size="64" class="welcome__avatar" />
        <div>
          <h1>欢迎回来，{{ username }}</h1>
          <p>在这里管理博客文件、维护账号并查看系统日志。</p>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>快捷入口</template>
      <div v-if="shortcuts.length" class="shortcuts">
        <el-button
          v-for="item in shortcuts"
          :key="item.path"
          class="shortcut"
          @click="router.push(item.path)"
        >
          <Icon :icon="item.icon" class="mr-8px" />
          {{ item.title }}
        </el-button>
      </div>
      <el-empty v-else description="当前账号暂无可用快捷入口" :image-size="80" />
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import avatarImg from '@/assets/imgs/avatar.gif'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

defineOptions({ name: 'Index' })

const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const avatar = computed(() => userStore.getUser.avatar || avatarImg)
const username = computed(() => userStore.getUser.nickname || '站长')

const quickLinks = [
  {
    title: '文件管理',
    path: '/infra/file/file',
    icon: 'ep:folder',
    permission: 'infra:file:query'
  },
  { title: '个人资料', path: '/user/profile', icon: 'ep:user', permission: '' },
  {
    title: '登录日志',
    path: '/system/log/login-log',
    icon: 'ep:document',
    permission: 'system:login-log:query'
  },
  {
    title: '操作日志',
    path: '/system/log/operate-log',
    icon: 'ep:list',
    permission: 'system:operate-log:query'
  }
]

// 只展示授权菜单中可进入且已注册的页面，避免兜底 404 被误判为可用路由。
const shortcuts = computed(() => {
  const availablePaths = new Set<string>()
  const collect = (routes: AppRouteRecordRaw[], parentPath = '', parentVisible = true) => {
    for (const route of routes) {
      const path = (route.path.startsWith('/') ? route.path : `${parentPath}/${route.path}`)
        .replace(/\/+/g, '/')
        .replace(/\/$/, '')
      const visible = parentVisible && !route.meta?.hidden
      if (route.component && (visible || route.meta?.canTo)) availablePaths.add(path)
      if (route.children) collect(route.children, path, visible)
    }
  }
  collect(permissionStore.getRouters)
  return quickLinks.filter((item) => {
    const permitted =
      !item.permission ||
      userStore.permissions.has('*:*:*') ||
      userStore.permissions.has(item.permission)
    const matched = router.resolve(item.path).matched
    return (
      permitted &&
      availablePaths.has(item.path) &&
      matched.some((route) => route.path === item.path && route.name !== '404Page')
    )
  })
})
</script>

<style scoped lang="scss">
.workbench {
  display: grid;
  gap: 16px;
}

.welcome {
  display: flex;
  align-items: center;
  gap: 16px;

  &__avatar {
    flex-shrink: 0;
  }

  h1 {
    margin: 0;
    font-size: 20px;
    font-weight: 500;
    overflow-wrap: anywhere;
  }

  p {
    margin: 8px 0 0;
    color: var(--el-text-color-secondary);
  }
}

.shortcuts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 180px), 1fr));
  gap: 12px;
}

.shortcut {
  height: 48px;
  margin: 0;
}
</style>

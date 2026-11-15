<template>
  <el-card shadow="never" class="project-resources">
    <template #header>
      <h1>原项目资源</h1>
    </template>
    <p class="description">集中收纳原项目源码、文档和相关资源，点击链接后在新标签页打开。</p>
    <el-input
      v-model="keyword"
      clearable
      placeholder="搜索标题、别名、分类、模块或网址"
      aria-label="筛选原项目资源"
      class="resource-search"
    />
    <p class="description" aria-live="polite">
      {{ filteredResources.length }} / {{ projectResources.length }} 项资源
    </p>

    <el-collapse v-if="groups.length" v-model="expandedCategories">
      <el-collapse-item
        v-for="group in groups"
        :key="group.category"
        :name="group.category"
        :title="`${group.category}（${group.items.length}）`"
      >
        <el-collapse v-if="group.modules.length" v-model="expandedModules" class="module-groups">
          <el-collapse-item
            v-for="module in group.modules"
            :key="module.name"
            :name="module.name"
            :title="`${module.name}（${module.items.length}）`"
          >
            <ul class="resource-list">
              <li v-for="resource in module.items" :key="resource.url">
                <el-link
                  :href="resource.url"
                  type="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ resource.title }}
                </el-link>
                <p v-if="resource.aliases?.length" class="resource-detail">
                  其他标题：{{ resource.aliases.join('、') }}
                </p>
                <p class="resource-detail">{{ resource.url }}</p>
              </li>
            </ul>
          </el-collapse-item>
        </el-collapse>
        <ul v-else class="resource-list">
          <li v-for="resource in group.items" :key="resource.url">
            <el-link :href="resource.url" type="primary" target="_blank" rel="noopener noreferrer">
              {{ resource.title }}
            </el-link>
            <p v-if="resource.aliases?.length" class="resource-detail">
              其他标题：{{ resource.aliases.join('、') }}
            </p>
            <p class="resource-detail">{{ resource.url }}</p>
          </li>
        </ul>
      </el-collapse-item>
    </el-collapse>
    <el-empty v-else description="没有找到匹配的资源" :image-size="80" />
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { projectResources, resourceCategories } from '@/config/project-resources'
import type { ResourceCategory } from '@/config/project-resources'

defineOptions({ name: 'ProjectResources' })

const keyword = ref('')
const expandedCategories = ref<ResourceCategory[]>(['源码与配套项目'])
const expandedModules = ref<string[]>([])
const filteredResources = computed(() => {
  const terms = keyword.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  return projectResources.filter((resource) => {
    const text = [
      resource.title,
      resource.url,
      resource.category,
      resource.module,
      ...(resource.aliases || []),
      ...(resource.keywords || [])
    ]
      .join(' ')
      .toLocaleLowerCase()
    return terms.every((term) => text.includes(term))
  })
})
const groups = computed(() =>
  resourceCategories
    .map((category) => {
      const items = filteredResources.value.filter((resource) => resource.category === category)
      const names = [...new Set(items.map((resource) => resource.module).filter(Boolean))]
      return {
        category,
        items,
        modules: names.map((name) => ({
          name: name!,
          items: items.filter((resource) => resource.module === name)
        }))
      }
    })
    .filter((group) => group.items.length)
)

// 筛选时展开命中的分类和模块，清空后恢复简洁的初始状态。
watch(keyword, (value) => {
  expandedCategories.value = value.trim()
    ? groups.value.map((group) => group.category)
    : ['源码与配套项目']
  expandedModules.value = value.trim()
    ? groups.value.flatMap((group) => group.modules.map((module) => module.name))
    : []
})
</script>

<style scoped lang="scss">
.project-resources h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.description,
.resource-detail {
  color: var(--el-text-color-secondary);
}

.resource-search {
  max-width: 560px;
}

.module-groups {
  margin-left: 12px;
}

.resource-list {
  padding: 0 8px;
  margin: 0;
  list-style: none;

  li {
    padding: 10px 0;
    overflow-wrap: anywhere;
  }
}

.resource-detail {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.6;
}
</style>

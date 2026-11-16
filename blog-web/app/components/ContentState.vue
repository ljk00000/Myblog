<script setup lang="ts">
withDefaults(defineProps<{ kind?: 'empty' | 'error' | 'loading'; title?: string; description?: string; retrying?: boolean; retry?: boolean }>(), { kind: 'empty', title: '暂无内容', description: '' })
defineEmits<{ retry: [] }>()
</script>
<template>
  <div class="content-state" :class="`state-${kind}`" :role="kind === 'error' ? 'alert' : 'status'" :aria-busy="kind === 'loading'">
    <h3>{{ kind === 'loading' ? '正在加载…' : title }}</h3>
    <p v-if="kind !== 'loading' && description">{{ description }}</p>
    <button v-if="retry" type="button" class="button button-secondary" :disabled="retrying" @click="$emit('retry')">{{ retrying ? '正在重试…' : '重新加载' }}</button>
    <slot />
  </div>
</template>

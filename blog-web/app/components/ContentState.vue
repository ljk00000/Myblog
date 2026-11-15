<script setup lang="ts">
withDefaults(defineProps<{ kind?: 'empty' | 'error' | 'loading'; title?: string; description?: string; retrying?: boolean; retry?: boolean }>(), { kind: 'empty', title: '这里还没有内容', description: '内容发布后会显示在这里。' })
defineEmits<{ retry: [] }>()
</script>
<template>
  <div class="content-state" :class="`state-${kind}`" :role="kind === 'error' ? 'alert' : 'status'" :aria-busy="kind === 'loading'">
    <span class="state-icon" aria-hidden="true"><AppIcon :name="kind === 'error' ? 'alert' : 'book'" /></span>
    <h3>{{ kind === 'loading' ? '正在加载…' : title }}</h3>
    <p v-if="kind !== 'loading'">{{ description }}</p>
    <button v-if="retry" type="button" class="button button-secondary" :disabled="retrying" @click="$emit('retry')">{{ retrying ? '正在重试…' : '重新加载' }}</button>
    <slot />
  </div>
</template>

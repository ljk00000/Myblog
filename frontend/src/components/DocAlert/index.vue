<template>
  <!-- 原项目文档已统一收纳到“原项目资源”，业务页不再显示文档推广提示。 -->
  <span v-if="false"></span>
</template>
<script setup lang="ts">
import { propTypes } from '@/utils/propTypes'

defineOptions({ name: 'DocAlert', inheritAttrs: false })

// 保留已有调用接口，避免逐页修改业务代码；不受环境变量影响。
defineProps({
  title: propTypes.string,
  url: propTypes.string
})
</script>

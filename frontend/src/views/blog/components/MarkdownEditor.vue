<template>
  <div class="blog-markdown-editor">
    <el-input
      ref="inputRef"
      :model-value="modelValue"
      :disabled="disabled"
      type="textarea"
      :rows="16"
      placeholder="请输入 Markdown 原文"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <el-collapse class="mt-10px">
      <el-collapse-item title="上传图片 / 附件并插入 Markdown" name="upload">
        <div class="blog-upload-row">
          <div>
            <UploadImg v-model="imageUrl" :disabled="disabled" directory="blog" />
            <el-button class="mt-10px" :disabled="disabled || !imageUrl" @click="insertUrl(true)">
              插入图片
            </el-button>
          </div>
          <div>
            <UploadFile
              v-model="attachmentUrl"
              :disabled="disabled"
              :file-type="[]"
              :limit="1"
              directory="blog"
            />
            <el-button :disabled="disabled || !attachmentUrl" @click="insertUrl(false)">
              插入附件链接
            </el-button>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div class="my-10px">
      <el-button
        v-hasPermi="previewPermissions"
        :loading="previewLoading"
        :disabled="disabled"
        @click="preview"
      >
        渲染预览
      </el-button>
      <span class="ml-10px text-[var(--el-text-color-secondary)]">
        预览由服务端统一渲染和净化；修改原文后请重新预览。
      </span>
    </div>
    <el-alert v-if="previewFailed" title="预览失败，请重试" type="error" :closable="false" />
    <template v-if="previewResult">
      <div class="mb-10px text-[var(--el-text-color-secondary)]">
        预计阅读 {{ previewResult.readingMinutes }} 分钟 · {{ previewResult.toc.length }} 个标题
      </div>
      <!-- HTML 仅来自统一的服务端净化接口。 -->
      <div
        v-if="previewResult.html"
        class="blog-markdown-preview"
        v-html="previewResult.html"
      ></div>
      <el-empty v-else description="暂无可预览内容" :image-size="60" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ElAlert, ElButton, ElCollapse, ElCollapseItem, ElEmpty, ElInput } from 'element-plus'
import type { InputInstance } from 'element-plus'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import { previewContent } from '@/api/blog/content'
import type { PreviewResult } from '@/api/blog/types'
import { hasPermission } from '@/directives/permission/hasPermi'
import { useMessage } from '@/hooks/web/useMessage'
import { isContentUrl, previewPermissions } from './helpers'

defineOptions({ name: 'BlogMarkdownEditor' })
const props = withDefaults(defineProps<{ modelValue: string; disabled?: boolean }>(), {
  disabled: false
})
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const message = useMessage()
const inputRef = ref<InputInstance>()
const imageUrl = ref('')
const attachmentUrl = ref('')
const previewLoading = ref(false)
const previewFailed = ref(false)
const previewResult = ref<PreviewResult>()
let previewVersion = 0

watch(
  () => props.modelValue,
  () => {
    previewVersion++
    previewLoading.value = false
    previewFailed.value = false
    previewResult.value = undefined
  }
)
onBeforeUnmount(() => previewVersion++)

const preview = async () => {
  if (!hasPermission(previewPermissions) || props.disabled || previewLoading.value) return
  const version = ++previewVersion
  previewLoading.value = true
  previewFailed.value = false
  previewResult.value = undefined
  try {
    const result = await previewContent(props.modelValue)
    if (version === previewVersion) previewResult.value = result
  } catch {
    // 请求拦截器负责具体错误消息，原位保留重试入口。
    if (version === previewVersion) previewFailed.value = true
  } finally {
    if (version === previewVersion) previewLoading.value = false
  }
}

const insertUrl = async (image: boolean) => {
  const url = image ? imageUrl.value : attachmentUrl.value
  if (props.disabled || !url) return
  if (!isContentUrl(url)) {
    message.error('上传结果不是有效的 HTTP(S) 地址或本项目路径')
    return
  }
  const textarea = inputRef.value?.textarea
  const start = textarea?.selectionStart ?? props.modelValue.length
  const end = textarea?.selectionEnd ?? start
  const safeUrl = url.replace(/[<>()]/g, (char) => encodeURIComponent(char))
  const insertion = `${image ? '!' : ''}[${image ? '图片' : '附件'}](<${safeUrl}>)`
  emit(
    'update:modelValue',
    props.modelValue.slice(0, start) + insertion + props.modelValue.slice(end)
  )
  await nextTick()
  inputRef.value?.focus()
  textarea?.setSelectionRange(start + insertion.length, start + insertion.length)
}
</script>

<style scoped lang="scss">
.blog-markdown-editor {
  width: 100%;
}

.blog-upload-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.blog-markdown-preview {
  padding: 16px;
  overflow-wrap: anywhere;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;

  :deep(img) {
    height: auto;
    max-width: 100%;
  }

  :deep(pre) {
    padding: 12px;
    overflow-x: auto;
    background: var(--el-fill-color-light);
  }

  :deep(table) {
    display: block;
    overflow-x: auto;
    border-collapse: collapse;
  }

  :deep(th),
  :deep(td) {
    padding: 6px 10px;
    border: 1px solid var(--el-border-color);
  }
}
</style>

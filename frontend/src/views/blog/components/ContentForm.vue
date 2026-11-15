<template>
  <Dialog
    v-model="visible"
    :title="`${currentId ? '编辑' : '新增'}${kind === 'article' ? '文章' : '资源'}`"
    width="min(1100px, 96vw)"
    :before-close="beforeClose"
  >
    <el-alert
      class="mb-15px"
      title="已发布内容保存后立即更新线上版本；发布后 slug 永久锁定，没有独立修订或定时发布。"
      type="warning"
      show-icon
      :closable="false"
    />
    <el-alert v-if="loadFailed" title="详情加载失败，请关闭后重试" type="error" :closable="false" />
    <el-form
      v-else
      ref="formRef"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      :disabled="loading || saving"
      label-width="100px"
    >
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="slug" prop="slug">
        <el-input
          v-model="formData.slug"
          :disabled="slugLocked"
          maxlength="120"
          placeholder="小写字母、数字和连字符"
        />
        <div v-if="slugLocked" class="text-[var(--el-text-color-secondary)]"
          >此内容已发布过，slug 不可更改。</div
        >
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select
          v-model="formData.categoryId"
          :disabled="!canQueryCategory"
          clearable
          filterable
          :empty-values="[null, undefined]"
          :value-on-clear="null"
          placeholder="可不选择分类"
          class="!w-full"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <div v-if="!canQueryCategory" class="text-[var(--el-text-color-secondary)]"
          >无分类查询权限，保留现有分类。</div
        >
      </el-form-item>
      <el-form-item v-if="kind === 'article'" label="标签" prop="tagIds">
        <el-select
          v-model="formData.tagIds"
          :disabled="!canQueryTag"
          multiple
          filterable
          clearable
          placeholder="可选择多个标签"
          class="!w-full"
        >
          <el-option
            v-for="item in tagOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <div v-if="!canQueryTag" class="text-[var(--el-text-color-secondary)]"
          >无标签查询权限，保留现有标签。</div
        >
      </el-form-item>
      <el-form-item label="摘要" prop="summary">
        <el-input v-model="formData.summary" type="textarea" :rows="3" placeholder="请输入摘要" />
      </el-form-item>
      <el-form-item label="封面地址" prop="coverUrl">
        <div class="w-full">
          <el-input
            v-model="formData.coverUrl"
            clearable
            placeholder="HTTP(S) 地址或本项目根路径"
            class="mb-10px"
          />
          <UploadImg
            :key="editorKey"
            v-model="formData.coverUrl"
            :disabled="loading || saving"
            directory="blog"
          />
        </div>
      </el-form-item>
      <template v-if="kind === 'resource'">
        <el-form-item label="资源类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio value="link">外部链接</el-radio>
            <el-radio value="file">文件附件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="资源地址" prop="url">
          <div class="w-full">
            <el-input
              v-model="formData.url"
              placeholder="HTTP(S) 地址或本项目根路径（不支持 //）"
            />
            <UploadFile
              v-if="formData.type === 'file'"
              :key="editorKey"
              v-model="formData.url"
              :disabled="loading || saving"
              :limit="1"
              :file-type="[]"
              directory="blog"
              class="mt-10px"
            />
          </div>
        </el-form-item>
        <el-form-item label="精选" prop="featured"
          ><el-switch v-model="formData.featured"
        /></el-form-item>
        <el-form-item label="排序" prop="sort"
          ><el-input-number v-model="formData.sort" :precision="0" :step="1"
        /></el-form-item>
      </template>
      <el-form-item v-else label="置顶" prop="pinned"
        ><el-switch v-model="formData.pinned"
      /></el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" class="!w-200px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="SEO 标题" prop="seoTitle"
        ><el-input v-model="formData.seoTitle" clearable
      /></el-form-item>
      <el-form-item label="SEO 描述" prop="seoDescription"
        ><el-input v-model="formData.seoDescription" type="textarea" :rows="2"
      /></el-form-item>
      <el-form-item label="Markdown" prop="contentMarkdown">
        <MarkdownEditor
          v-if="!loading"
          :key="editorKey"
          v-model="formData.contentMarkdown"
          :disabled="saving"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button
        v-hasPermi="[permission]"
        type="primary"
        :loading="saving"
        :disabled="loading || loadFailed"
        @click="submit"
      >
        {{ formData.status === 1 ? '保存并立即上线' : '保存' }}
      </el-button>
      <el-button :disabled="saving" @click="visible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import {
  ElAlert,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElInputNumber,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElSelect,
  ElSwitch,
  vLoading
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'
import UploadFile from '@/components/UploadFile/src/UploadFile.vue'
import * as ArticleApi from '@/api/blog/article'
import * as ResourceApi from '@/api/blog/resource'
import { toArticleSave, toResourceSave } from '@/api/blog/types'
import type { ArticleSave, ResourceSave, Category, ContentKind, Tag } from '@/api/blog/types'
import { hasPermission } from '@/directives/permission/hasPermi'
import { useMessage } from '@/hooks/web/useMessage'
import MarkdownEditor from './MarkdownEditor.vue'
import { optionalUrlRule, slugRules, statusOptions } from './helpers'

defineOptions({ name: 'BlogContentForm' })
const props = defineProps<{ kind: ContentKind; categories: Category[]; tags: Tag[] }>()
const emit = defineEmits<{ success: [] }>()
const message = useMessage()
const visible = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadFailed = ref(false)
const currentId = ref<number>()
const slugLocked = ref(false)
const editorKey = ref(0)
const formRef = ref<FormInstance>()
const permission = computed(() => `blog:${props.kind}:${currentId.value ? 'update' : 'create'}`)
const canQueryCategory = computed(() => hasPermission(['blog:category:query']))
const canQueryTag = computed(() => hasPermission(['blog:tag:query']))
const existingCategoryName = ref('')
const existingTags = ref<Tag[]>([])
const defaults = (): ArticleSave & ResourceSave => ({
  title: '',
  slug: '',
  summary: '',
  contentMarkdown: '',
  coverUrl: '',
  categoryId: null,
  tagIds: [],
  pinned: false,
  status: 0,
  seoTitle: '',
  seoDescription: '',
  type: 'link',
  url: '',
  featured: false,
  sort: 0
})
const formData = ref(defaults())
const categoryOptions = computed(() => {
  const options = [...props.categories]
  const id = formData.value.categoryId
  if (id != null && !options.some((item) => item.id === id)) {
    options.push({
      id,
      name: existingCategoryName.value || `分类 #${id}`,
      slug: '',
      type: props.kind,
      sort: 0
    })
  }
  return options
})
const tagOptions = computed(() => {
  const options = [...props.tags]
  for (const id of formData.value.tagIds) {
    if (!options.some((item) => item.id === id)) {
      options.push(
        existingTags.value.find((item) => item.id === id) ?? { id, name: `标签 #${id}`, slug: '' }
      )
    }
  }
  return options
})
const rules: FormRules = {
  title: [{ required: true, whitespace: true, message: '请输入标题', trigger: 'blur' }],
  slug: slugRules,
  coverUrl: [optionalUrlRule],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
  url: [{ required: true, message: '请输入资源地址', trigger: 'blur' }, optionalUrlRule],
  sort: [{ required: true, type: 'integer', message: '请输入整数排序', trigger: 'blur' }]
}
const beforeClose = (done: () => void) => {
  if (!saving.value) done()
}
let openVersion = 0
watch(visible, (value) => {
  if (!value) openVersion++
})

const open = async (id?: number) => {
  if (saving.value || !hasPermission([`blog:${props.kind}:${id ? 'update' : 'create'}`])) return
  const version = ++openVersion
  currentId.value = id
  formData.value = defaults()
  slugLocked.value = false
  existingCategoryName.value = ''
  existingTags.value = []
  loadFailed.value = false
  visible.value = true
  loading.value = !!id
  editorKey.value++
  await nextTick()
  formRef.value?.clearValidate()
  if (!id) return
  try {
    if (props.kind === 'article') {
      const detail = await ArticleApi.getArticle(id)
      if (version !== openVersion) return
      formData.value = { ...defaults(), ...toArticleSave(detail) }
      existingTags.value = detail.tags ?? []
      existingCategoryName.value = detail.categoryName ?? ''
      slugLocked.value = !!detail.publishTime || detail.status === 1
    } else {
      const detail = await ResourceApi.getResource(id)
      if (version !== openVersion) return
      formData.value = { ...defaults(), ...toResourceSave(detail) }
      existingCategoryName.value = detail.categoryName ?? ''
      slugLocked.value = !!detail.publishTime || detail.status === 1
    }
  } catch {
    if (version === openVersion) loadFailed.value = true
  } finally {
    if (version === openVersion) loading.value = false
  }
}
defineExpose({ open })

const submit = async () => {
  if (loading.value || saving.value || loadFailed.value || !hasPermission([permission.value]))
    return
  saving.value = true
  try {
    if (!(await formRef.value?.validate().catch(() => false))) return
    if (formData.value.status === 1) {
      await message.confirm('保存后内容立即在公开站点上线，且发布过的 slug 不可更改。确认保存？')
    }
    if (props.kind === 'article') {
      const data = toArticleSave(formData.value)
      if (currentId.value) await ArticleApi.updateArticle({ ...data, id: currentId.value })
      else await ArticleApi.createArticle(data)
    } else {
      const data = toResourceSave(formData.value)
      if (currentId.value) await ResourceApi.updateResource({ ...data, id: currentId.value })
      else await ResourceApi.createResource(data)
    }
    message.success('保存成功')
    visible.value = false
    emit('success')
  } catch {
    // 取消确认或业务错误均保留表单，请求拦截器负责错误提示。
  } finally {
    saving.value = false
  }
}
</script>

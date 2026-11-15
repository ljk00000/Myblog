<template>
  <ContentWrap>
    <el-form :model="query" :inline="true" label-width="68px" class="-mb-15px">
      <el-form-item label="关键词">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="筛选名称 / slug"
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="kind === 'category'" label="分类类型">
        <el-select v-model="query.type" clearable placeholder="全部类型" class="!w-180px">
          <el-option label="文章分类" value="article" /><el-option
            label="资源分类"
            value="resource"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-hasPermi="[`${prefix}:query`]" :loading="loading" @click="handleQuery"
          ><Icon icon="ep:search" class="mr-5px" />搜索</el-button
        >
        <el-button v-hasPermi="[`${prefix}:query`]" @click="resetQuery"
          ><Icon icon="ep:refresh" class="mr-5px" />重置</el-button
        >
        <el-button v-hasPermi="[`${prefix}:create`]" type="primary" plain @click="openForm()"
          ><Icon icon="ep:plus" class="mr-5px" />新增</el-button
        >
      </el-form-item>
    </el-form>
  </ContentWrap>
  <ContentWrap>
    <el-alert v-if="!canQuery" title="暂无查询权限" type="warning" :closable="false" />
    <template v-else>
      <el-alert
        v-if="loadFailed"
        class="mb-10px"
        title="列表加载失败，请重新搜索"
        type="error"
        :closable="false"
      />
      <el-table
        v-loading="loading"
        :data="filteredList"
        row-key="id"
        :empty-text="loadFailed ? '加载失败，请重试' : `暂无${label}`"
      >
        <el-table-column label="编号" prop="id" width="100" align="center" />
        <el-table-column label="名称" prop="name" min-width="160" show-overflow-tooltip />
        <el-table-column label="slug" prop="slug" min-width="180" show-overflow-tooltip />
        <el-table-column v-if="kind === 'category'" label="类型" width="140" align="center"
          ><template #default="{ row }">{{
            row.type === 'article' ? '文章分类' : '资源分类'
          }}</template></el-table-column
        >
        <el-table-column
          v-if="kind === 'category'"
          label="排序"
          prop="sort"
          width="100"
          align="center"
        />
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button
              v-hasPermi="[`${prefix}:update`]"
              link
              type="primary"
              :disabled="busy"
              @click="openForm(row)"
              >编辑</el-button
            >
            <el-button
              v-hasPermi="[`${prefix}:delete`]"
              link
              type="danger"
              :disabled="busy"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </template>
  </ContentWrap>
  <Dialog
    v-model="visible"
    :title="`${editingId ? '编辑' : '新增'}${label}`"
    width="min(560px, 96vw)"
    :before-close="beforeClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" :disabled="saving" label-width="90px">
      <el-form-item label="名称" prop="name"
        ><el-input v-model="formData.name" placeholder="请输入名称"
      /></el-form-item>
      <el-form-item label="slug" prop="slug"
        ><el-input v-model="formData.slug" maxlength="120" placeholder="小写字母、数字和连字符"
      /></el-form-item>
      <template v-if="kind === 'category'">
        <el-form-item label="类型" prop="type"
          ><el-radio-group v-model="formData.type"
            ><el-radio value="article">文章分类</el-radio
            ><el-radio value="resource">资源分类</el-radio></el-radio-group
          ></el-form-item
        >
        <el-form-item label="排序" prop="sort"
          ><el-input-number v-model="formData.sort" :precision="0" :step="1"
        /></el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button
        v-hasPermi="[`${prefix}:${editingId ? 'update' : 'create'}`]"
        type="primary"
        :loading="saving"
        @click="submit"
        >保存</el-button
      >
      <el-button :disabled="saving" @click="visible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
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
  ElTable,
  ElTableColumn,
  vLoading
} from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { Dialog } from '@/components/Dialog'
import { Icon } from '@/components/Icon'
import * as CategoryApi from '@/api/blog/category'
import * as TagApi from '@/api/blog/tag'
import type { Category, CategorySave, ContentKind, Tag } from '@/api/blog/types'
import { hasPermission } from '@/directives/permission/hasPermi'
import { useMessage } from '@/hooks/web/useMessage'
import { slugRules } from './helpers'

defineOptions({ name: 'BlogTaxonomyPage' })
const props = defineProps<{ kind: 'category' | 'tag' }>()
const prefix = computed(() => `blog:${props.kind}`)
const label = computed(() => (props.kind === 'category' ? '分类' : '标签'))
const canQuery = computed(() => hasPermission([`${prefix.value}:query`]))
const message = useMessage()
const query = reactive<{ keyword: string; type?: ContentKind }>({ keyword: '', type: undefined })
const keyword = ref('')
const list = ref<(Category | Tag)[]>([])
const filteredList = computed(() =>
  list.value.filter(
    (row) => !keyword.value || `${row.name} ${row.slug}`.toLowerCase().includes(keyword.value)
  )
)
const loading = ref(false)
const loadFailed = ref(false)
const busy = ref(false)
const visible = ref(false)
const saving = ref(false)
const editingId = ref<number>()
const formRef = ref<FormInstance>()
const formData = ref<CategorySave>({ name: '', slug: '', type: 'article', sort: 0 })
const rules: FormRules = {
  name: [{ required: true, whitespace: true, message: '请输入名称', trigger: 'blur' }],
  slug: slugRules,
  type: [{ required: true, message: '请选择分类类型', trigger: 'change' }],
  sort: [{ required: true, type: 'integer', message: '请输入整数排序', trigger: 'blur' }]
}
let listVersion = 0
onBeforeUnmount(() => listVersion++)
const getList = async () => {
  if (!canQuery.value) return
  const version = ++listVersion
  loading.value = true
  loadFailed.value = false
  try {
    const data =
      props.kind === 'category'
        ? await CategoryApi.getCategoryList(query.type || undefined)
        : await TagApi.getTagList()
    if (version === listVersion) list.value = data
  } catch {
    if (version === listVersion) {
      list.value = []
      loadFailed.value = true
    }
  } finally {
    if (version === listVersion) loading.value = false
  }
}
const handleQuery = () => {
  keyword.value = query.keyword.trim().toLowerCase()
  void getList()
}
const resetQuery = () => {
  query.keyword = ''
  query.type = undefined
  handleQuery()
}
const beforeClose = (done: () => void) => {
  if (!saving.value) done()
}
const openForm = async (row?: Category | Tag) => {
  if (saving.value || !hasPermission([`${prefix.value}:${row ? 'update' : 'create'}`])) return
  editingId.value = row?.id
  formData.value = {
    name: row?.name ?? '',
    slug: row?.slug ?? '',
    type: row && 'type' in row ? row.type : query.type || 'article',
    sort: row && 'sort' in row ? row.sort : 0
  }
  visible.value = true
  await nextTick()
  formRef.value?.clearValidate()
}
const submit = async () => {
  if (saving.value || !hasPermission([`${prefix.value}:${editingId.value ? 'update' : 'create'}`]))
    return
  saving.value = true
  try {
    if (!(await formRef.value?.validate().catch(() => false))) return
    const data = { ...formData.value }
    if (props.kind === 'category') {
      if (editingId.value) await CategoryApi.updateCategory({ ...data, id: editingId.value })
      else await CategoryApi.createCategory(data)
    } else {
      if (editingId.value)
        await TagApi.updateTag({ id: editingId.value, name: data.name, slug: data.slug })
      else await TagApi.createTag({ name: data.name, slug: data.slug })
    }
    message.success('保存成功')
    visible.value = false
    await getList()
  } catch {
    // 请求拦截器展示校验和业务错误，保留表单。
  } finally {
    saving.value = false
  }
}
const handleDelete = async (row: Category | Tag) => {
  if (busy.value || !hasPermission([`${prefix.value}:delete`])) return
  busy.value = true
  try {
    await message.delConfirm(
      `确认删除${label.value}“${row.name}”？已被内容引用的${label.value}无法删除。`
    )
    if (props.kind === 'category') await CategoryApi.deleteCategory(row.id)
    else await TagApi.deleteTag(row.id)
    message.success('删除成功')
    await getList()
  } catch {
    // 被引用等业务错误由既有 CommonResult 请求拦截器直接提示。
  } finally {
    busy.value = false
  }
}
onMounted(() => {
  void getList()
})
</script>

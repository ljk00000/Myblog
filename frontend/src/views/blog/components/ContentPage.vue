<template>
  <ContentWrap>
    <el-form :model="query" :inline="true" label-width="68px" class="-mb-15px">
      <el-form-item label="关键词">
        <el-input
          v-model="query.keyword"
          clearable
          placeholder="搜索标题 / 摘要"
          class="!w-220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item v-if="canQueryCategory" label="分类">
        <el-select
          v-model="query.categoryId"
          clearable
          filterable
          placeholder="全部分类"
          class="!w-180px"
        >
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item v-if="kind === 'article' && canQueryTag" label="标签">
        <el-select
          v-model="query.tagId"
          clearable
          filterable
          placeholder="全部标签"
          class="!w-180px"
        >
          <el-option v-for="item in tags" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="kind === 'resource'" label="类型">
        <el-select v-model="query.type" clearable placeholder="全部类型" class="!w-160px">
          <el-option label="外部链接" value="link" />
          <el-option label="文件附件" value="file" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" clearable placeholder="全部状态" class="!w-160px">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
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
        v-if="lookupFailed"
        class="mb-10px"
        title="分类或标签加载失败，可重试；现有内容关联会保留。"
        type="warning"
        :closable="false"
      >
        <el-button
          v-hasPermi="['blog:category:query', 'blog:tag:query']"
          link
          type="primary"
          :loading="lookupLoading"
          @click="loadLookups"
          >重新加载选项</el-button
        >
      </el-alert>
      <el-alert
        v-if="loadFailed"
        class="mb-10px"
        title="列表加载失败，请重新搜索"
        type="error"
        :closable="false"
      />
      <el-table
        v-loading="loading"
        :data="list"
        row-key="id"
        :empty-text="loadFailed ? '加载失败，请重试' : '暂无内容'"
      >
        <el-table-column label="编号" prop="id" width="80" align="center" />
        <el-table-column label="标题" prop="title" min-width="200" show-overflow-tooltip />
        <el-table-column label="slug" prop="slug" min-width="160" show-overflow-tooltip />
        <el-table-column label="分类" min-width="110" align="center">
          <template #default="{ row }">{{ row.categoryName || '未分类' }}</template>
        </el-table-column>
        <el-table-column v-if="kind === 'article'" label="标签" min-width="150">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags || []" :key="tag.id" class="mr-5px">{{
              tag.name
            }}</el-tag>
            <span v-if="!row.tags?.length">—</span>
          </template>
        </el-table-column>
        <el-table-column v-if="kind === 'resource'" label="类型" width="100" align="center">
          <template #default="{ row }">{{
            row.type === 'file' ? '文件附件' : '外部链接'
          }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }"
            ><el-tag :type="statusOptions.find((item) => item.value === row.status)?.type">{{
              statusOptions.find((item) => item.value === row.status)?.label || '未知状态'
            }}</el-tag></template
          >
        </el-table-column>
        <el-table-column :label="kind === 'article' ? '置顶' : '精选'" width="80" align="center">
          <template #default="{ row }">{{
            (kind === 'article' ? row.pinned : row.featured) ? '是' : '否'
          }}</template>
        </el-table-column>
        <el-table-column
          v-if="kind === 'resource'"
          label="排序"
          prop="sort"
          width="80"
          align="center"
        />
        <el-table-column label="发布时间" width="175" align="center"
          ><template #default="{ row }">{{
            formatBlogDate(row.publishTime)
          }}</template></el-table-column
        >
        <el-table-column label="更新时间" width="175" align="center"
          ><template #default="{ row }">{{
            formatBlogDate(row.updateTime)
          }}</template></el-table-column
        >
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button
              v-hasPermi="[`${prefix}:update`]"
              link
              type="primary"
              :disabled="busyId !== undefined"
              @click="openForm(row.id)"
              >编辑</el-button
            >
            <el-button
              v-if="row.status !== 1"
              v-hasPermi="[`${prefix}:update`]"
              link
              type="success"
              :loading="busyId === row.id"
              :disabled="busyId !== undefined"
              @click="changeStatus(row, 1)"
              >发布</el-button
            >
            <el-button
              v-else
              v-hasPermi="[`${prefix}:update`]"
              link
              type="warning"
              :loading="busyId === row.id"
              :disabled="busyId !== undefined"
              @click="changeStatus(row, 2)"
              >下架</el-button
            >
            <el-button
              v-hasPermi="[`${prefix}:delete`]"
              link
              type="danger"
              :disabled="busyId !== undefined"
              @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-model:page="query.pageNo"
        v-model:limit="query.pageSize"
        :total="total"
        @pagination="getList"
      />
    </template>
  </ContentWrap>
  <ContentForm
    ref="formRef"
    :kind="kind"
    :categories="categories"
    :tags="tags"
    @success="getList"
  />
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import {
  ElAlert,
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElSelect,
  ElTable,
  ElTableColumn,
  ElTag,
  vLoading
} from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { Icon } from '@/components/Icon'
import Pagination from '@/components/Pagination/index.vue'
import * as ArticleApi from '@/api/blog/article'
import * as ResourceApi from '@/api/blog/resource'
import { getCategoryList } from '@/api/blog/category'
import { getTagList } from '@/api/blog/tag'
import { toArticleSave, toResourceSave } from '@/api/blog/types'
import type {
  ArticlePageParams,
  ArticleRow,
  Category,
  ContentKind,
  ContentStatus,
  ResourcePageParams,
  ResourceRow,
  Tag
} from '@/api/blog/types'
import { hasPermission } from '@/directives/permission/hasPermi'
import { useMessage } from '@/hooks/web/useMessage'
import ContentForm from './ContentForm.vue'
import { formatBlogDate, statusOptions } from './helpers'

defineOptions({ name: 'BlogContentPage' })
const props = defineProps<{ kind: ContentKind }>()
const prefix = computed(() => `blog:${props.kind}`)
const canQuery = computed(() => hasPermission([`${prefix.value}:query`]))
const canQueryCategory = computed(() => hasPermission(['blog:category:query']))
const canQueryTag = computed(() => hasPermission(['blog:tag:query']))
const message = useMessage()
const formRef = ref<InstanceType<typeof ContentForm>>()
const loading = ref(false)
const loadFailed = ref(false)
const lookupLoading = ref(false)
const lookupFailed = ref(false)
const total = ref(0)
const list = ref<(ArticleRow | ResourceRow)[]>([])
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])
const busyId = ref<number>()
const query = reactive<ArticlePageParams & ResourcePageParams>({
  pageNo: 1,
  pageSize: 10,
  keyword: undefined,
  categoryId: undefined,
  tagId: undefined,
  status: undefined,
  type: undefined
})
let listVersion = 0
onBeforeUnmount(() => listVersion++)

const getList = async () => {
  if (!canQuery.value) return
  const version = ++listVersion
  loading.value = true
  loadFailed.value = false
  const params = {
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    keyword: query.keyword?.trim() || undefined,
    categoryId: query.categoryId || undefined,
    status: query.status ?? undefined
  }
  try {
    const result =
      props.kind === 'article'
        ? await ArticleApi.getArticlePage({ ...params, tagId: query.tagId || undefined })
        : await ResourceApi.getResourcePage({ ...params, type: query.type || undefined })
    if (version !== listVersion) return
    list.value = result.list
    total.value = result.total
    if (!result.list.length && query.pageNo > 1) {
      query.pageNo = Math.max(
        1,
        Math.min(query.pageNo - 1, Math.ceil(result.total / query.pageSize))
      )
      await getList()
    }
  } catch {
    if (version === listVersion) {
      list.value = []
      total.value = 0
      loadFailed.value = true
    }
  } finally {
    if (version === listVersion) loading.value = false
  }
}

const loadLookups = async () => {
  if (lookupLoading.value) return
  lookupLoading.value = true
  lookupFailed.value = false
  const jobs: Promise<void>[] = []
  if (canQueryCategory.value)
    jobs.push(
      getCategoryList(props.kind)
        .then((data) => {
          categories.value = data
        })
        .catch(() => {
          lookupFailed.value = true
        })
    )
  if (props.kind === 'article' && canQueryTag.value)
    jobs.push(
      getTagList()
        .then((data) => {
          tags.value = data
        })
        .catch(() => {
          lookupFailed.value = true
        })
    )
  try {
    await Promise.all(jobs)
  } finally {
    lookupLoading.value = false
  }
}
const handleQuery = () => {
  query.pageNo = 1
  void getList()
}
const resetQuery = () => {
  Object.assign(query, {
    pageNo: 1,
    pageSize: 10,
    keyword: undefined,
    categoryId: undefined,
    tagId: undefined,
    status: undefined,
    type: undefined
  })
  void getList()
}
const openForm = (id?: number) => {
  void loadLookups()
  void formRef.value?.open(id)
}

const changeStatus = async (row: ArticleRow | ResourceRow, status: ContentStatus) => {
  if (busyId.value !== undefined || !hasPermission([`${prefix.value}:update`])) return
  busyId.value = row.id
  try {
    await message.confirm(
      status === 1
        ? `确认发布“${row.title}”？内容会立即公开，发布过的 slug 不可更改。`
        : `确认下架“${row.title}”？下架后公开站点将不可见。`
    )
    // 分页没有正文；读取完整详情后再按可编辑字段白名单更新，避免覆盖原文。
    if (props.kind === 'article') {
      const detail = await ArticleApi.getArticle(row.id)
      await ArticleApi.updateArticle({ ...toArticleSave(detail), id: row.id, status })
    } else {
      const detail = await ResourceApi.getResource(row.id)
      await ResourceApi.updateResource({ ...toResourceSave(detail), id: row.id, status })
    }
    message.success(status === 1 ? '发布成功' : '下架成功')
    await getList()
  } catch {
    // 确认取消无需提示；业务错误由既有请求拦截器展示。
  } finally {
    busyId.value = undefined
  }
}
const handleDelete = async (row: ArticleRow | ResourceRow) => {
  if (busyId.value !== undefined || !hasPermission([`${prefix.value}:delete`])) return
  busyId.value = row.id
  try {
    await message.delConfirm(`确认删除“${row.title}”？`)
    if (props.kind === 'article') await ArticleApi.deleteArticle(row.id)
    else await ResourceApi.deleteResource(row.id)
    message.success('删除成功')
    await getList()
  } catch {
    // 使用既有请求和消息处理。
  } finally {
    busyId.value = undefined
  }
}
onMounted(() => {
  void getList()
  void loadLookups()
})
</script>

<template>
  <ContentWrap>
    <el-alert
      class="mb-15px"
      title="站点设置保存后立即在公开站点生效。关于页 Markdown 由服务端统一渲染和净化。"
      type="info"
      show-icon
      :closable="false"
    />
    <el-button
      v-hasPermi="['blog:site:query']"
      :loading="loading"
      :disabled="saving"
      class="mb-15px"
      @click="loadSite"
      ><Icon icon="ep:refresh" class="mr-5px" />重新加载</el-button
    >
    <el-alert v-if="!canQuery" title="暂无站点查询权限" type="warning" :closable="false" />
    <el-alert
      v-else-if="loadFailed"
      title="站点设置加载失败，请重新加载"
      type="error"
      :closable="false"
    />
    <el-form
      v-else
      ref="formRef"
      v-loading="loading"
      :model="formData"
      :rules="rules"
      :disabled="!loaded || !canUpdate || saving"
      label-width="110px"
    >
      <el-form-item label="站点标题" prop="title"
        ><el-input v-model="formData.title" placeholder="请输入站点标题"
      /></el-form-item>
      <el-form-item label="副标题" prop="subtitle"
        ><el-input v-model="formData.subtitle"
      /></el-form-item>
      <el-form-item label="站点描述" prop="description"
        ><el-input v-model="formData.description" type="textarea" :rows="3"
      /></el-form-item>
      <el-form-item label="作者名称" prop="authorName"
        ><el-input v-model="formData.authorName"
      /></el-form-item>
      <el-form-item label="头像地址" prop="avatarUrl">
        <div class="w-full">
          <el-input
            v-model="formData.avatarUrl"
            clearable
            placeholder="HTTP(S) 地址或本项目根路径"
            class="mb-10px"
          />
          <UploadImg
            v-if="loaded"
            :key="editorKey"
            v-model="formData.avatarUrl"
            :disabled="!canUpdate || saving"
            directory="blog"
          />
        </div>
      </el-form-item>
      <el-form-item label="站点地址" prop="siteUrl"
        ><el-input v-model="formData.siteUrl" placeholder="绝对 HTTP(S) 地址，不带末尾斜杠"
      /></el-form-item>
      <el-form-item label="GitHub 地址" prop="githubUrl"
        ><el-input v-model="formData.githubUrl" clearable placeholder="HTTP(S) 地址，可留空"
      /></el-form-item>
      <el-form-item label="邮箱" prop="email"
        ><el-input v-model="formData.email" clearable
      /></el-form-item>
      <el-form-item label="页脚文本" prop="footerText"
        ><el-input v-model="formData.footerText" type="textarea" :rows="2"
      /></el-form-item>
      <el-form-item label="关于 Markdown" prop="aboutMarkdown"
        ><MarkdownEditor
          v-if="loaded"
          :key="editorKey"
          v-model="formData.aboutMarkdown"
          :disabled="!canUpdate || saving"
      /></el-form-item>
      <el-form-item>
        <el-button
          v-hasPermi="['blog:site:update']"
          type="primary"
          :loading="saving"
          :disabled="!loaded || loading"
          @click="submit"
          >保存并立即生效</el-button
        >
      </el-form-item>
    </el-form>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElAlert, ElButton, ElForm, ElFormItem, ElInput, vLoading } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ContentWrap } from '@/components/ContentWrap'
import { Icon } from '@/components/Icon'
import UploadImg from '@/components/UploadFile/src/UploadImg.vue'
import { getSite, updateSite } from '@/api/blog/site'
import { toSiteSave } from '@/api/blog/types'
import type { SiteSave } from '@/api/blog/types'
import { hasPermission } from '@/directives/permission/hasPermi'
import { useMessage } from '@/hooks/web/useMessage'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import { isHttpUrl, optionalUrlRule } from '../components/helpers'

defineOptions({ name: 'BlogSite' })
const message = useMessage()
const canQuery = computed(() => hasPermission(['blog:site:query']))
const canUpdate = computed(() => hasPermission(['blog:site:update']))
const loading = ref(false)
const saving = ref(false)
const loaded = ref(false)
const loadFailed = ref(false)
const editorKey = ref(0)
const formRef = ref<FormInstance>()
const formData = ref<SiteSave>({
  title: '',
  subtitle: '',
  description: '',
  authorName: '',
  avatarUrl: '',
  aboutMarkdown: '',
  siteUrl: '',
  githubUrl: '',
  email: '',
  footerText: ''
})
const rules: FormRules = {
  title: [{ required: true, whitespace: true, message: '请输入站点标题', trigger: 'blur' }],
  avatarUrl: [optionalUrlRule],
  siteUrl: [
    { required: true, message: '请输入站点地址', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (isHttpUrl(value) && !value.endsWith('/')) callback()
        else callback(new Error('请输入绝对 HTTP(S) 地址，且不要以 / 结尾'))
      },
      trigger: 'blur'
    }
  ],
  githubUrl: [
    {
      validator: (_rule, value: string, callback) => {
        if (!value || isHttpUrl(value)) callback()
        else callback(new Error('请输入有效的 HTTP(S) 地址'))
      },
      trigger: 'blur'
    }
  ],
  email: [{ type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }]
}
const loadSite = async () => {
  if (!canQuery.value || loading.value || saving.value) return
  loading.value = true
  loaded.value = false
  loadFailed.value = false
  try {
    formData.value = toSiteSave(await getSite())
    loaded.value = true
    editorKey.value++
    await nextTick()
    formRef.value?.clearValidate()
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}
const submit = async () => {
  if (!loaded.value || loading.value || saving.value || !canUpdate.value) return
  saving.value = true
  try {
    if (!(await formRef.value?.validate().catch(() => false))) return
    await updateSite(formData.value)
    message.success('保存成功，站点设置已立即生效')
  } catch {
    // 请求拦截器展示错误；保留输入以便重试。
  } finally {
    saving.value = false
  }
}
onMounted(() => {
  void loadSite()
})
</script>

import dayjs from 'dayjs'
import type { FormItemRule } from 'element-plus'
import type { BlogDate, ContentStatus } from '@/api/blog/types'

export const statusOptions: {
  value: ContentStatus
  label: string
  type: 'info' | 'success' | 'warning'
}[] = [
  { value: 0, label: '草稿', type: 'info' },
  { value: 1, label: '已发布', type: 'success' },
  { value: 2, label: '已下架', type: 'warning' }
]

export const slugRules: FormItemRule[] = [
  { required: true, message: '请输入 slug', trigger: 'blur' },
  { pattern: /^[a-z0-9-]+$/, message: '仅支持小写字母、数字和连字符', trigger: 'blur' },
  { max: 120, message: 'slug 最多 120 个字符', trigger: 'blur' }
]

export const isHttpUrl = (value: string) => {
  if (!/^https?:\/\//i.test(value) || /[\s\\]/.test(value)) return false
  try {
    const url = new URL(value)
    return !!url.hostname && ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

export const isContentUrl = (value: string) =>
  isHttpUrl(value) || (/^\/(?!\/)/.test(value) && !/[\s\\]/.test(value))

export const optionalUrlRule: FormItemRule = {
  validator: (_rule, value: string, callback) => {
    if (!value || isContentUrl(value)) callback()
    else callback(new Error('请输入 HTTP(S) 地址或以 / 开头的本项目路径（不支持 //）'))
  },
  trigger: 'blur'
}

export const formatBlogDate = (value?: BlogDate) => {
  if (!value) return '—'
  const date = Array.isArray(value)
    ? dayjs(new Date(value[0], value[1] - 1, value[2], value[3] ?? 0, value[4] ?? 0, value[5] ?? 0))
    : dayjs(value)
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '—'
}

export const previewPermissions = [
  'blog:article:create',
  'blog:article:update',
  'blog:resource:create',
  'blog:resource:update',
  'blog:category:create',
  'blog:category:update',
  'blog:tag:create',
  'blog:tag:update',
  'blog:site:update'
]

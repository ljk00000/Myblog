import request from '@/config/axios'
import type { PreviewResult } from '../types'

export const previewContent = (markdown: string) =>
  request.post<PreviewResult>({ url: '/blog/content/preview', data: { markdown } })

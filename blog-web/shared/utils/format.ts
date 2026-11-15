import type { BlogDate } from '../types/blog'

export function dateParts(value: BlogDate | undefined): number[] | null {
  if (!value) return null
  if (Array.isArray(value)) return value.length >= 3 ? value : null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null
}
export function isoDate(value: BlogDate | undefined): string | undefined {
  const p = dateParts(value)
  return p ? `${p[0]}-${String(p[1]).padStart(2, '0')}-${String(p[2]).padStart(2, '0')}` : undefined
}
export function formatDate(value: BlogDate | undefined): string {
  const p = dateParts(value)
  return p ? `${p[0]} 年 ${p[1]} 月 ${p[2]} 日` : ''
}
export function formatMonth(value: string): string {
  return /^\d{4}-\d{2}$/.test(value) ? `${value.slice(0, 4)} 年 ${Number(value.slice(5))} 月` : value
}
export function safeUrl(value: string | null | undefined, allowRoot = true): string | undefined {
  if (!value || /[\u0000-\u0020\\]/.test(value)) return undefined
  if (allowRoot && value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined
  } catch { return undefined }
}
export function safeEmail(value: string | undefined): string | undefined {
  return value && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && !/[?&#]/.test(value) ? `mailto:${value}` : undefined
}
export function plainText(html: string | undefined): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/&(?:nbsp|amp|lt|gt|quot|#\d+);/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
}

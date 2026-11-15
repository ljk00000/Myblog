import request from '@/config/axios'
import type { Category, CategorySave, ContentKind } from '../types'

export const getCategoryList = (type?: ContentKind) =>
  request.get<Category[]>({ url: '/blog/category/list', params: { type } })

const toSave = (data: CategorySave): CategorySave => ({
  name: data.name,
  slug: data.slug,
  type: data.type,
  sort: data.sort
})

export const createCategory = (data: CategorySave) =>
  request.post<number>({ url: '/blog/category/create', data: toSave(data) })

export const updateCategory = (data: Category) =>
  request.put<boolean>({ url: '/blog/category/update', data: { ...toSave(data), id: data.id } })

export const deleteCategory = (id: number) =>
  request.delete<boolean>({ url: '/blog/category/delete', params: { id } })

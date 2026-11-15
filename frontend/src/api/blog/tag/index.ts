import request from '@/config/axios'
import type { Tag, TagSave } from '../types'

export const getTagList = () => request.get<Tag[]>({ url: '/blog/tag/list' })

const toSave = (data: TagSave): TagSave => ({ name: data.name, slug: data.slug })

export const createTag = (data: TagSave) =>
  request.post<number>({ url: '/blog/tag/create', data: toSave(data) })

export const updateTag = (data: Tag) =>
  request.put<boolean>({ url: '/blog/tag/update', data: { ...toSave(data), id: data.id } })

export const deleteTag = (id: number) =>
  request.delete<boolean>({ url: '/blog/tag/delete', params: { id } })

import request from '@/config/axios'
import { toResourceSave } from '../types'
import type { PageResult, Resource, ResourcePageParams, ResourceRow, ResourceSave } from '../types'

export const getResourcePage = (params: ResourcePageParams) =>
  request.get<PageResult<ResourceRow>>({ url: '/blog/resource/page', params })

export const getResource = (id: number) =>
  request.get<Resource>({ url: '/blog/resource/get', params: { id } })

export const createResource = (data: ResourceSave) =>
  request.post<number>({ url: '/blog/resource/create', data: toResourceSave(data) })

export const updateResource = (data: ResourceSave & { id: number }) =>
  request.put<boolean>({
    url: '/blog/resource/update',
    data: { ...toResourceSave(data), id: data.id }
  })

export const deleteResource = (id: number) =>
  request.delete<boolean>({ url: '/blog/resource/delete', params: { id } })

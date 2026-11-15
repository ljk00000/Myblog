import request from '@/config/axios'
import { toSiteSave } from '../types'
import type { Site, SiteSave } from '../types'

export const getSite = () => request.get<Site>({ url: '/blog/site/get' })

export const updateSite = (data: SiteSave) =>
  request.put<boolean>({ url: '/blog/site/update', data: toSiteSave(data) })

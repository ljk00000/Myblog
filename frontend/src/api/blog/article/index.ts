import request from '@/config/axios'
import { toArticleSave } from '../types'
import type { Article, ArticlePageParams, ArticleRow, ArticleSave, PageResult } from '../types'

export const getArticlePage = (params: ArticlePageParams) =>
  request.get<PageResult<ArticleRow>>({ url: '/blog/article/page', params })

export const getArticle = (id: number) =>
  request.get<Article>({ url: '/blog/article/get', params: { id } })

export const createArticle = (data: ArticleSave) =>
  request.post<number>({ url: '/blog/article/create', data: toArticleSave(data) })

export const updateArticle = (data: ArticleSave & { id: number }) =>
  request.put<boolean>({
    url: '/blog/article/update',
    data: { ...toArticleSave(data), id: data.id }
  })

export const deleteArticle = (id: number) =>
  request.delete<boolean>({ url: '/blog/article/delete', params: { id } })

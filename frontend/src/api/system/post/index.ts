import request from '@/config/axios'

export interface PostVO {
  id?: number
  name: string
  code: string
  sort: number
  status: number
  remark: string
  createTime?: Date
}

// 获取岗位精简信息列表
export const getSimplePostList = async (): Promise<PostVO[]> => {
  return await request.get({ url: '/system/post/simple-list' })
}

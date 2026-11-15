import request from '@/config/axios'

export interface SocialUserVO {
  id: number
  type: number
  openid: string
  token: string
  rawTokenInfo: string
  nickname: string
  avatar: string
  rawUserInfo: string
  code: string
  state: string
}

// 获得绑定社交用户列表
export const getBindSocialUserList = async () => {
  return await request.get({ url: '/system/social-user/get-bind-list' })
}

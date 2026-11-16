import type { SupabaseClient, User } from '@supabase/supabase-js'
import { OWNER_AUTH_STORAGE_KEY, readOwnerAuthConfig } from '#shared/utils/ownerAuth'

let clientPromise: Promise<SupabaseClient> | undefined
let restorePromise: Promise<void> | undefined

export function useOwnerAuth() {
  const settings = readOwnerAuthConfig(useRuntimeConfig().public)
  const configured = Boolean(settings)
  const user = useState<{ id: string; email: string } | null>('owner-auth:user', () => null)
  const initialized = useState('owner-auth:initialized', () => false)
  const busy = useState('owner-auth:busy', () => false)
  const error = useState('owner-auth:error', () => '')
  const setOwner = (value: User) => { user.value = { id: value.id, email: value.email || '' } }

  async function getClient() {
    if (!import.meta.client || !settings) throw new Error('not_configured')
    clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) => {
      const client = createClient(settings.url, settings.key, { auth: {
        storage: window.sessionStorage,
        storageKey: OWNER_AUTH_STORAGE_KEY,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      } })
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') user.value = null
        if (event === 'TOKEN_REFRESHED' && user.value && session?.user.id === settings.ownerId) setOwner(session.user)
      })
      return client
    }).catch(cause => { clientPromise = undefined; throw cause })
    return clientPromise
  }

  async function initialize() {
    if (!import.meta.client || initialized.value) return
    restorePromise ??= (async () => {
      try {
        if (!settings || !window.sessionStorage.getItem(OWNER_AUTH_STORAGE_KEY)) return
        const client = await getClient()
        const { data, error: authError } = await client.auth.getUser()
        if (authError?.name === 'AuthRetryableFetchError') {
          error.value = '暂时无法验证登录状态，请稍后重新登录。'
        } else if (authError || data.user?.id !== settings.ownerId) {
          await client.auth.signOut({ scope: 'local' })
        } else if (data.user) {
          setOwner(data.user)
        }
      } catch {
        error.value = '暂时无法恢复登录状态，请重新登录。'
      } finally {
        initialized.value = true
        restorePromise = undefined
      }
    })()
    await restorePromise
  }

  async function signIn(email: string, password: string) {
    if (busy.value || !initialized.value) return false
    busy.value = true
    error.value = ''
    try {
      const client = await getClient()
      const { data, error: authError } = await client.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      if (!data.user || data.user.id !== settings?.ownerId) {
        await client.auth.signOut({ scope: 'local' })
        error.value = '此账号不是本站站长账号。'
        return false
      }
      setOwner(data.user)
      return true
    } catch (cause) {
      const failure = cause as { code?: string; status?: number }
      error.value = failure.status === 429
        ? '尝试次数较多，请稍后再试。'
        : ['invalid_credentials', 'email_not_confirmed', 'user_banned'].includes(failure.code || '')
          ? '邮箱或密码不正确，或账号暂不可用。'
          : '登录服务暂时无法连接，请稍后重试。'
      return false
    } finally {
      busy.value = false
    }
  }

  async function signOut() {
    if (busy.value) return
    busy.value = true
    error.value = ''
    try {
      const client = await getClient()
      const { error: authError } = await client.auth.signOut({ scope: 'local' })
      user.value = null
      if (authError) error.value = '已退出当前标签页；网络异常，服务端注销尚未确认。'
    } catch {
      error.value = '退出未完成，请稍后重试。'
    } finally {
      busy.value = false
    }
  }

  return { configured, user, initialized, busy, error, initialize, signIn, signOut }
}

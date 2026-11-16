export const OWNER_AUTH_STORAGE_KEY = 'myblog-owner-auth-v1'

interface OwnerAuthInput {
  supabaseUrl?: string
  supabasePublishableKey?: string
  ownerUserId?: string
}

export function readOwnerAuthConfig(input: OwnerAuthInput) {
  const url = input.supabaseUrl?.trim() || ''
  const key = input.supabasePublishableKey?.trim() || ''
  const ownerId = input.ownerUserId?.trim().toLowerCase() || ''
  if (!url && !key && !ownerId) return null
  if (!url || !key || !ownerId) throw new Error('Set all three public owner-auth settings: Supabase URL, publishable key and owner user ID.')

  let endpoint: URL
  try { endpoint = new URL(url) } catch { throw new Error('Owner auth requires a valid hosted Supabase HTTPS URL.') }
  if (endpoint.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(endpoint.hostname) || endpoint.port || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || endpoint.pathname !== '/') {
    throw new Error('Owner auth requires the hosted Supabase HTTPS project origin, without a path or credentials.')
  }
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(ownerId)) throw new Error('Owner user ID must be a Supabase user UUID.')

  let publicKey = /^sb_publishable_[A-Za-z0-9_-]{8,}$/.test(key)
  if (!publicKey && key.split('.').length === 3) {
    try { publicKey = JSON.parse(atob(key.split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))).role === 'anon' } catch { /* Invalid keys are rejected below. */ }
  }
  if (!publicKey) throw new Error('Owner auth accepts only a publishable key or legacy anon key. Never use a secret or service-role key in public configuration.')
  return { url: endpoint.origin, key, ownerId }
}

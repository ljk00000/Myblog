import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readOwnerAuthConfig } from '../shared/utils/ownerAuth.ts'

const settings = {
  supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
  supabasePublishableKey: `sb_publishable_${'fixture'.repeat(4)}`,
  ownerUserId: '11111111-1111-4111-8111-111111111111',
}

test('unconfigured auth leaves public reading available', () => {
  assert.equal(readOwnerAuthConfig({}), null)
})
test('accepts a hosted project with a publishable key and normalizes the origin', () => {
  assert.deepEqual(readOwnerAuthConfig({ ...settings, supabaseUrl: `${settings.supabaseUrl}/` }), {
    url: settings.supabaseUrl, key: settings.supabasePublishableKey, ownerId: settings.ownerUserId,
  })
})
test('rejects incomplete settings and invalid owner IDs', () => {
  assert.throws(() => readOwnerAuthConfig({ supabaseUrl: settings.supabaseUrl }))
  assert.throws(() => readOwnerAuthConfig({ ...settings, ownerUserId: 'admin' }))
})
test('rejects insecure, unrelated and credential-bearing endpoints', () => {
  for (const supabaseUrl of ['http://abcdefghijklmnopqrst.supabase.co', 'https://example.com', 'https://abcdefghijklmnopqrst.supabase.co/auth/v1', `https://${['user', 'pass'].join(':')}@abcdefghijklmnopqrst.supabase.co`, `${settings.supabaseUrl}?key=fixture`, `${settings.supabaseUrl}#fragment`, 'not-a-url']) {
    assert.throws(() => readOwnerAuthConfig({ ...settings, supabaseUrl }))
  }
})
test('allows legacy anon keys but rejects secret and service-role keys without echoing them', () => {
  const jwt = (role: string) => ['e30', Buffer.from(JSON.stringify({ role })).toString('base64url'), 'fixture'].join('.')
  assert.ok(readOwnerAuthConfig({ ...settings, supabasePublishableKey: jwt('anon') }))
  for (const key of [`sb_${'secret'}_${'fixture'.repeat(4)}`, jwt('service_role'), 'invalid']) {
    assert.throws(() => readOwnerAuthConfig({ ...settings, supabasePublishableKey: key }), (error: Error) => !error.message.includes(key))
  }
})

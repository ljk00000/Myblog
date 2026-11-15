export default defineEventHandler(event => {
  if (!event.path.startsWith('/_nuxt/')) setHeader(event, 'Cache-Control', 'no-store')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin')
})

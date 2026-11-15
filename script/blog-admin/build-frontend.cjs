const { spawnSync } = require('node:child_process')
const path = require('node:path')

// Explicit defaults also override any upstream .env files left on a developer machine.
// Set process environment variables before running this script to customize a deployment.
const defaults = {
  VITE_APP_TITLE: '芋道管理系统',
  VITE_PORT: '80',
  VITE_OPEN: 'false',
  VITE_BASE_PATH: '/',
  VITE_BASE_URL: '',
  VITE_API_URL: '/admin-api',
  VITE_OUT_DIR: 'dist-prod',
  VITE_UPLOAD_TYPE: 'server',
  VITE_APP_CAPTCHA_ENABLE: 'false',
  VITE_APP_TENANT_ENABLE: 'true',
  VITE_APP_DEFAULT_LOGIN_TENANT: '芋道源码',
  VITE_APP_DEFAULT_LOGIN_USERNAME: '',
  VITE_APP_DEFAULT_LOGIN_PASSWORD: '',
  VITE_APP_BAIDU_CODE: '',
  VITE_APP_DOCALERT_ENABLE: 'false',
  VITE_APP_API_ENCRYPT_ENABLE: 'false',
  VITE_USE_ONLINE_ICON: 'true',
  VITE_USE_BUNDLE_ANALYZER: 'false',
  VITE_SOURCEMAP: 'false',
  VITE_DROP_DEBUGGER: 'true',
  VITE_DROP_CONSOLE: 'true',
  VITE_COMPRESS: 'gzip'
}

const env = { ...process.env }
for (const [key, value] of Object.entries(defaults)) {
  if (!(key in env)) env[key] = value
}

const result = spawnSync(
  process.platform === 'win32' ? 'cmd.exe' : 'pnpm',
  process.platform === 'win32' ? ['/d', '/s', '/c', 'pnpm build:prod'] : ['build:prod'],
  { cwd: path.resolve(__dirname, '../../frontend'), env, stdio: 'inherit' }
)
if (result.error) console.error(result.error.message)
process.exit(result.status ?? 1)

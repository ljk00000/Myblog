<script setup lang="ts">
defineProps<{ name: 'web' | 'admin' | 'gateway' | 'service' | 'database' | 'cache' | 'registry' | 'export' | 'pages' | 'browser' | 'deploy' | 'markdown' }>()
const paths = {
  web: 'M3 5h18v14H3ZM3 9h18M7 7h.01M10 7h.01m0 5-3 2 3 2m4-4 3 2-3 2',
  admin: 'M3 4h18v16H3ZM3 9h18M9 9v11M6 6.5h.01M12 13h6m-6 3h4',
  gateway: 'M9 3h6v6H9ZM2 15h6v6H2Zm14 0h6v6h-6ZM12 9v3M5 15v-3h14v3',
  service: 'M4 3h16v7H4Zm0 11h16v7H4ZM7 6.5h.01M7 17.5h.01M11 6.5h6m-6 11h6',
  database: 'M20 6c0 2-3.6 3-8 3S4 8 4 6s3.6-3 8-3 8 1 8 3Zm0 0v12c0 2-3.6 3-8 3s-8-1-8-3V6m0 6c0 2 3.6 3 8 3s8-1 8-3',
  cache: 'm12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 16l10 5 10-5',
  registry: 'M9 9h6v6H9ZM12 3v6m0 6v6M3 12h6m6 0h6M5 5l4 4m6 6 4 4M5 19l4-4m6-6 4-4',
  export: 'M14 3H5v18h14V8Zm0 0v5h5M8 13h7m-3-3 3 3-3 3M8 18h7',
  pages: 'M9 4H3v16h18V4h-6M8 14l-3-3 3-3m8 6 3-3-3-3M14 6l-4 10',
  browser: 'M3 3h18v14H3ZM3 7h18M8 21h8m-4-4v4M6 5h.01M9 5h.01',
  deploy: 'M8 8V5a4 4 0 0 1 8 0v3m-4 0v7m-3-3 3 3 3-3M6 10H3v11h18V10h-3',
  markdown: 'M3 4h18v16H3ZM6 15V9l3 3 3-3v6m3-3 2 2 2-2m-2 2V9',
}
</script>
<template><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name]" /></svg></template>

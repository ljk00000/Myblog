import { readOwnerAuthConfig } from '../../shared/utils/ownerAuth'

export default defineNitroPlugin(() => {
  readOwnerAuthConfig(useRuntimeConfig().public)
})

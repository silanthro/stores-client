import { type RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import type { RepoMetadata } from '@/utils/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: useStorage('user', undefined) as RemovableRef<string | undefined>,
    oauthToken: useStorage('oauthToken', undefined) as RemovableRef<
      string | undefined
    >,
    oauthRefreshToken: useStorage(
      'oauthRefreshToken',
      undefined,
    ) as RemovableRef<string | undefined>,
    repos: [] as RepoMetadata[],
  }),
  getters: {},
  actions: {
    async logout() {
      await supabase.auth.signOut()
      this.user = undefined
      this.oauthToken = undefined
      this.oauthRefreshToken = undefined
    },
  },
})

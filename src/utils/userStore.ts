import { type RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase'
import type { RepoMetadata } from '@/utils/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    username: useStorage('user', undefined) as RemovableRef<string | undefined>,
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
    async login() {
      supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'public_repo',
        },
      })
    },
    async logout() {
      await supabase.auth.signOut()
      this.username = undefined
      this.oauthToken = undefined
      this.oauthRefreshToken = undefined
    },
  },
})

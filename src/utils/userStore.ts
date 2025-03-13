import { type RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { getUserRepos } from './githubApi'
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
    repos: useStorage('repos', []) as RemovableRef<RepoMetadata[]>,
    repoOwners: useStorage('repoOwners', []) as RemovableRef<string[]>,
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
    async listRepos() {
      if (!this.oauthToken) return
      this.repos = await getUserRepos(this.oauthToken)
      this.repoOwners = [...new Set(this.repos.map((r) => r.owner as string))]
      if (this.repoOwners.includes(this.username as string)) {
        this.repoOwners = this.repoOwners.filter((o) => o != this.username)
        this.repoOwners.unshift(this.username as string)
      }
    },
    async addIndex(index: RepoMetadata) {
      // TODO: Handle error
      const addIndexRequest = await supabase
        .from('tool_indexes')
        .insert({
          full_name: index.full_name,
          clone_url: index.clone_url,
          branch: index.branch,
          commit: index.commit,
          desc: index.desc,
          readme: index.readme,
          // user: '',
        })
        .select('id')
        .single()
      if (!addIndexRequest.error) {
        const indexId = addIndexRequest.data?.id
        await supabase.from('tools').insert(
          index.tools?.map((t) => ({
            index: indexId,
            name: t.name,
            doc: t.doc,
            inputs: t.inputs,
            output: t.output,
            // user: '',
          })),
        )
      }
    },
  },
})

import { type RemovableRef, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { getUserRepos } from '@/utils/githubApi'
import { supabase } from '@/utils/supabase'
import type { RepoMetadata } from '@/utils/types/tools'

const REDIRECT_URL =
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3000'
    : 'https://stores-tools.vercel.app'

export const useUserStore = defineStore('user', {
  state: () => ({
    userId: useStorage('userId', undefined) as RemovableRef<string | undefined>,
    username: useStorage('username', undefined) as RemovableRef<
      string | undefined
    >,
    oauthToken: undefined as string | undefined,
    repos: useStorage('repos', []) as RemovableRef<RepoMetadata[]>,
    repoOwners: useStorage('repoOwners', []) as RemovableRef<string[]>,
  }),
  getters: {},
  actions: {
    async login() {
      await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'public_repo',
          redirectTo: REDIRECT_URL,
        },
      })
    },
    async logout() {
      await supabase.auth.signOut()
      this.username = undefined
      this.oauthToken = undefined
      this.repos = []
      this.repoOwners = []
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
          commit: index.commit,
          description: index.description,
          readme: index.readme,
          owner: this.userId,
          version: index.version,
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
            owner: this.userId,
          })),
        )
      } else {
        throw addIndexRequest.error
      }
    },
  },
})

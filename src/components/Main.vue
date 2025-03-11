<template>
  <div class="flex flex-col w-screen h-screen items-center justify-center">
    {{ store.oauthToken }}
    <button @click="githubLogin">Log in with GitHub</button>
    <button @click="store.logout">Log out</button>
    <button @click="getRepos">Get repos</button>
    <button @click="loadFileOps">Load file-ops</button>
    <select
      v-if="store.repos.length"
      @change="(e) => selectRepoHandler((e.target as any).value)">
      <option v-for="repo in store.repos" :value="repo.full_name">
        {{ repo.full_name }}
      </option>
    </select>
    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>
    <div class="flex flex-col gap-2">
      {{ lastCommit }}
      <Markdown :markdown="readme" />
      <div v-for="tool in tools" class="border border-r-6 border-b-6 p-4">
        <div class="text-lg font-medium">{{ tool.name }}</div>
        <div>
          <label class="font-medium text-xs uppercase text-neutral-500">
            Docstring
          </label>
          <pre class="font-sans">{{ tool.doc }}</pre>
        </div>
        <div>
          <label class="font-medium text-xs uppercase text-neutral-500">
            Inputs
          </label>
          <ul>
            <li v-for="input in tool.inputs">
              <span class="font-medium">{{ input.name }}</span
              >: {{ input.type }}
            </li>
          </ul>
        </div>
        <div>
          <label class="font-medium text-xs uppercase text-neutral-500">
            Output
          </label>
          <div>
            {{ tool.output }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import Markdown from '@/components/Markdown.vue'
import { getLastCommit, getUserRepos, loadToolIndex } from '@/utils/githubApi'
import { supabase } from '@/utils/supabase'
import type { ToolMetadata } from '@/utils/types'
import { useUserStore } from '@/utils/userStore'

const store = useUserStore()

async function githubLogin() {
  supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'public_repo',
    },
  })
}

async function getRepos() {
  if (!store.oauthToken) return
  store.repos = await getUserRepos(store.oauthToken)
}

const error = ref<undefined | string>()
const lastCommit = ref('')
const tools = ref<ToolMetadata[]>([])
const readme = ref('')
const loading = ref(false)
async function loadIndex(clone_url: string) {
  loading.value = true
  const response = await loadToolIndex(clone_url)
  error.value = response.error
  tools.value = response.tools || []
  readme.value = response.readme || ''
  loading.value = false
}

async function selectRepoHandler(repoName: string) {
  const repo = store.repos.find((r) => r.full_name === repoName)
  if (!repo) return
  else await loadIndex(repo.clone_url)
}

async function loadFileOps() {
  if (!store.oauthToken) return
  const requests = await Promise.all([
    getLastCommit('greentfrapp/file-ops', 'main', store.oauthToken),
    loadIndex('https://github.com/greentfrapp/file-ops.git'),
  ])
  lastCommit.value = requests[0]
}
</script>

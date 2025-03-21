<template>
  <div class="max-w-[72rem] mx-auto h-full flex flex-col gap-8">
    <div v-if="loading" class="mt-24 h-full flex justify-center items-center">
      Loading...
    </div>
    <div v-else-if="index" class="mt-24 w-full flex flex-col gap-4">
      <div class="flex items-center gap-3 justify-between">
        <div class="flex items-center gap-3">
          <h2>
            {{ index.full_name
            }}<span class="font-mono font-semibold text-neutral-500"
              >:{{ index.version }}</span
            >
          </h2>
          <CopyButton :copy="index.full_name" />
        </div>
      </div>
      <div>{{ index.description }}</div>
      <ToolIndexPreview :index="index" />
    </div>
    <div v-else class="h-full flex flex-col justify-center items-center gap-10">
      <div>
        {{ error }}
      </div>
      <button
        class="border px-4 py-3 hover:outline-1 text-neutral-600 hover:text-black">
        <RouterLink v-if="userStore.username" to="/add_index"
          >Add an index</RouterLink
        >
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToolIndexPreview from '@/components/ToolIndexPreview.vue'
import CopyButton from '@/components/elements/CopyButton.vue'
import { getBranches } from '@/utils/githubApi'
import { supabase } from '@/utils/supabase'
import { RepoMetadata } from '@/utils/types'
import { useUserStore } from '@/utils/userStore'

const route = useRoute()
const userStore = useUserStore()

const loading = ref(true)
const error = ref('')
const index = ref<RepoMetadata | undefined>()

const indexName = computed(() => {
  return (route.params.id as string[]).join('/')
})
watch(indexName, fetchIndex, { immediate: true })

const userIsOwner = computed(() => {
  return index.value && index.value.owner === userStore.userId
})

const updateAvailable = ref(false)
async function fetchIndex(indexName: string) {
  loading.value = true
  // Fetch tool from supabase
  const fetchIndexRequest = await supabase
    .from('tool_indexes')
    .select(
      'full_name,clone_url,version,commit,description,readme,tools(name,doc,inputs,output),owner',
    )
    .eq('full_name', indexName)
    .order('added_at', { ascending: false })
    .limit(1)
    .single()
  if (fetchIndexRequest.error) {
    error.value = 'No tool index found'
  } else {
    index.value = fetchIndexRequest.data as RepoMetadata
  }
  // If user is owner, check if repo has been updated
  if (index.value) {
    const fetchedBranches = await getBranches(
      indexName,
      userStore.oauthToken as string,
    )
    const fetchedBranch = fetchedBranches.find(
      (b) => b.name === index.value?.branch,
    )
    updateAvailable.value = fetchedBranch?.commit != index.value?.commit
  }
  loading.value = false
}
</script>

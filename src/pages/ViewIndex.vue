<template>
  <div class="max-w-[72rem] h-full flex flex-col gap-8">
    <div v-if="loading" class="mt-24 h-full flex justify-center items-center">
      Loading...
    </div>
    <div v-else-if="index" class="mt-24 w-full flex flex-col gap-4">
      <div class="flex items-center gap-3 justify-between">
        <div class="flex items-center gap-3">
          <h2>{{ index.full_name }}</h2>
          <CopyButton :copy="index.full_name" />
        </div>
      </div>
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

async function fetchIndex(indexName: string) {
  loading.value = true
  // Fetch tool from supabase
  const fetchIndexRequest = await supabase
    .from('tool_indexes')
    .select(
      'full_name,clone_url,branch,commit,description,readme,tools(name,doc,inputs,output)',
    )
    .eq('full_name', indexName)
    .single()
  if (fetchIndexRequest.error) {
    error.value = 'No tool index found'
  } else {
    index.value = fetchIndexRequest.data as RepoMetadata
  }
  loading.value = false
}
</script>

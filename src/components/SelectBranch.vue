<template>
  <div class="w-full space-y-4">
    <div class="max-w-full flex items-center justify-between">
      <h3 class="text-2xl">{{ props.repo.full_name }}</h3>
      <CTAButton
        v-if="index && index.tools"
        :disabled="addingIndex"
        @click="addIndex(index)">
        {{ addingIndex ? 'Adding...' : 'Add to Stores' }}
      </CTAButton>
    </div>
    <div class="flex items-center gap-2">
      <BranchIcon class="w-4 h-4 text-neutral-400" />
      <Listbox :options="branches" v-model="branch" labelKey="name" />
      <div class="font-mono text-neutral-500">
        {{ branch.commit.slice(0, 6) }}
      </div>
    </div>
    <div v-if="loading" class="border py-10 text-center text-neutral-500">
      Loading...
    </div>
    <div v-else-if="index && index.tools">
      <div>
        <div class="border w-full" v-if="loading">Loading...</div>
        <ToolIndexPreview v-else :index="index" />
      </div>
    </div>
    <div
      v-else
      class="py-10 flex justify-center items-center border text-neutral-500">
      <p class="text-center">
        No tools found.
        <br />
        Try selecting a different branch
        <br />
        or a different repository.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType, onMounted, ref } from 'vue'
import ToolIndexPreview from './ToolIndexPreview.vue'
import BranchIcon from './icons/BranchIcon.vue'
import CTAButton from '@/components/CTAButton.vue'
import Listbox from '@/components/Listbox.vue'
import { getBranches, loadToolIndex } from '@/utils/githubApi'
import { RepoMetadata } from '@/utils/types'
import { useUserStore } from '@/utils/userStore'

const props = defineProps({
  repo: {
    type: Object as PropType<RepoMetadata>,
    required: true,
  },
})
const emit = defineEmits<{
  (e: 'addIndex', index: RepoMetadata): void
}>()

const userStore = useUserStore()

const loading = ref(true)
const error = ref('')
const branch = ref({ name: props.repo.branch, commit: '' })
const branches = ref<{ name: string; commit: string }[]>([])

const index = ref<RepoMetadata | undefined>(props.repo)

const addingIndex = ref(false)
function addIndex(index: RepoMetadata) {
  addingIndex.value = true
  emit('addIndex', index)
}

onMounted(async () => {
  loading.value = true
  const branchesRequest = getBranches(
    props.repo.full_name,
    userStore.oauthToken as string,
  )
  const toolIndexRequest = loadToolIndex(props.repo.clone_url)
  const [fetchedBranches, fetchedIndex] = await Promise.all([
    branchesRequest,
    toolIndexRequest,
  ])
  branches.value = fetchedBranches
  branch.value.commit = fetchedBranches.find(
    (b) => b.name === branch.value.name,
  )?.commit
  if (fetchedIndex.error) {
    error.value = fetchedIndex.error
  } else {
    index.value = {
      ...index.value,
      commit: branch.value.commit,
      readme: fetchedIndex.readme,
      tools: fetchedIndex.tools,
    } as RepoMetadata
  }
  loading.value = false
})
</script>

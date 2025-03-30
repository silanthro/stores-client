<template>
  <div class="w-full space-y-4">
    <div class="max-w-full flex items-start justify-between gap-4">
      <div class="flex gap-0 items-center shrink overflow-hidden">
        <h3 class="text-2xl truncate shrink h-10">
          {{ props.repo.full_name }}
        </h3>
        <div
          v-if="existingIndexNotOwned"
          class="ml-2 text-sm bg-red-50 text-red-700 flex items-center px-4 shrink-0">
          Already owned by another user
        </div>
        <div v-else-if="existingIndex" class="flex shrink-0 items-center gap-2">
          <div class="inline text-3xl font-mono font-semibold text-neutral-500">
            :{{ existingIndex.version }}
          </div>
        </div>
      </div>
      <div
        class="flex gap-2 w-max shrink-0"
        v-if="!loading && index && index.tools">
        <div v-if="unchangedFromLatest" class="flex items-center px-2">
          No change from latest version
        </div>
        <div v-else class="flex items-center gap-2">
          {{ existingIndex ? 'New version' : 'Version' }}
          <div class="relative">
            <input
              type="text"
              placeholder="1.0.0"
              v-model="newVersion"
              @blur="checkVersion(newVersion)"
              class="border px-3 py-2 w-24 font-mono" />
            <div
              v-if="versionError"
              class="absolute top-full translate-y-2 px-3 py-1 text-sm left-1/2 -translate-x-1/2 bg-red-50 text-red-700 w-max max-w-[200px] text-center">
              <div>
                {{ versionError }}
              </div>
            </div>
          </div>
        </div>
        <ElementsCTAButton
          class="h-max"
          :disabled="
            unchangedFromLatest ||
            versionError ||
            existingIndexNotOwned ||
            addingIndex
          "
          @click="addIndex(index)">
          {{
            addingIndex
              ? 'Adding...'
              : existingIndex
                ? 'Update index'
                : 'Add to Stores'
          }}
        </ElementsCTAButton>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <IconsBranchIcon class="w-4 h-4 text-neutral-400" />
      <ElementsListbox :options="branches" v-model="branch" labelKey="name" />
      <IconsCommitIcon class="w-4 h-4 text-neutral-400" />
      <input
        type="text"
        :value="commitInput"
        @blur="(e) => (commitInput = (e.target as HTMLInputElement).value)"
        class="border px-4 py-2 truncate font-mono text-neutral-500 w-30" />
      <button
        v-if="!isHeadCommit"
        class="flex items-center gap-2 text-neutral-500"
        title="Reset to latest commit"
        @click="commitInput = branch.commit">
        <ArrowPathIcon class="w-4 h-4" />
      </button>
    </div>
    <div v-if="loading" class="border py-10 text-center text-neutral-500">
      Loading...
    </div>
    <div
      v-else-if="error"
      class="py-10 flex justify-center items-center border text-neutral-500">
      <p class="text-center">
        Error: {{ error }}
        <br />
        Try selecting a different branch
        <br />
        or a different repository.
      </p>
    </div>
    <div v-else-if="index && index.tools" class="space-y-4">
      <div>{{ index.description }}</div>
      <ToolIndexPreview :index="index" />
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
import { ArrowPathIcon } from '@heroicons/vue/16/solid'
import { compare, validate } from 'compare-versions'
import { getBranches, loadToolIndex } from '@/utils/githubApi'
import type { RepoMetadata } from '@/utils/types/tools'

const props = defineProps({
  repo: {
    type: Object as PropType<RepoMetadata>,
    required: true,
  },
})

const userStore = useUserStore()
const router = useRouter()

const loading = ref(true)
const error = ref('')
const branch = ref({ name: props.repo.branch, commit: '' })
const branches = ref<{ name: string; commit: string }[]>([])
const commitInput = ref('')

const isHeadCommit = computed(() => {
  return commitInput.value === branch.value.commit
})

const index = ref<RepoMetadata | undefined>(props.repo)
const newVersion = ref('1.0.0')
const versionError = ref('')
function checkVersion(version: string) {
  versionError.value = ''
  if (!validate(version)) {
    versionError.value = 'Invalid semantic version'
  } else if (existingIndex.value && existingIndex.value.version) {
    if (!compare(version, existingIndex.value.version, '>')) {
      versionError.value = 'New version needs to be greater than latest version'
    }
  }
}

// Refresh index when branch or commit is changed
watch(branch, async (newBranch) => {
  commitInput.value = newBranch.commit
})
watch(commitInput, async (newCommit) => {
  if (!index.value) return
  if (newCommit != index.value.commit)
    await refreshIndex(props.repo.clone_url, branch.value.name, newCommit)
})

const refreshingIndex = ref(false)
async function refreshIndex(
  cloneURL: string,
  branch?: string,
  commit?: string,
) {
  if (refreshingIndex.value) return
  refreshingIndex.value = true
  error.value = ''
  const fetchedIndex = await loadToolIndex(cloneURL, branch, commit)
  if (fetchedIndex.error) {
    error.value = fetchedIndex.error
    index.value = props.repo
  } else {
    index.value = {
      ...index.value,
      commit: fetchedIndex.commit,
      readme: fetchedIndex.readme,
      description: fetchedIndex.description,
      tools: fetchedIndex.tools,
    } as RepoMetadata
    commitInput.value = fetchedIndex.commit as string
  }
  refreshingIndex.value = false
}

const addingIndex = ref(false)
async function addIndex(index: RepoMetadata) {
  // Check version is greater than latest version
  checkVersion(newVersion.value)
  if (!versionError.value && !addingIndex.value) {
    index.version = newVersion.value
    addingIndex.value = true
    try {
      await userStore.addIndex(index)
      router.push(`index/${index.full_name}`)
    } catch (e: any) {
      error.value = e.toString()
    }
  }
}

const toolsStore = useToolsStore()
const existingIndexNotOwned = computed(() => {
  if (!index.value) return false
  return toolsStore.tool_indexes.some(
    (t) =>
      t.full_name === index.value?.full_name && t.owner != userStore.userId,
  )
})
const existingIndex = computed(() => {
  if (!index.value) return undefined
  return toolsStore.tool_indexes.find(
    (t) =>
      t.full_name === index.value?.full_name && t.owner === userStore.userId,
  )
})
watch(
  existingIndex,
  (index) => {
    if (!index) return
    if (!index.version) return
    const prevVersionParts = index.version.split('.')
    prevVersionParts[1] = (parseInt(prevVersionParts[1]) + 1).toString()
    newVersion.value = prevVersionParts.join('.')
  },
  { immediate: true },
)
const unchangedFromLatest = computed(() => {
  if (!existingIndex.value || !index.value) return false
  return existingIndex.value.commit === index.value.commit
})

onMounted(async () => {
  const branchesRequest = getBranches(
    props.repo.full_name,
    userStore.oauthToken as string,
  )
  const refreshIndexPromise = refreshIndex(props.repo.clone_url)
  const [fetchedBranches, _] = await Promise.all([
    branchesRequest,
    refreshIndexPromise,
  ])
  branches.value = fetchedBranches
  branch.value.commit = fetchedBranches.find(
    (b) => b.name === branch.value.name,
  )?.commit
  loading.value = false
})
</script>

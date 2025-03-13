<template>
  <div class="max-w-full flex flex-col gap-4 p-4 border bg-white">
    <div v-if="loading" class="text-neutral-500">Loading...</div>
    <div v-else class="flex flex-col gap-4">
      <div class="flex gap-4">
        <div class="w-max shrink-0">
          <Combobox
            :options="userStore.repoOwners.map((o) => ({ label: o }))"
            v-model="selectedRepoOwner" />
        </div>
        <div class="border flex items-center gap-2 p-2">
          <MagnifyingGlassIcon class="w-4 h-4" />
          <input type="text" v-model="query" placeholder="Search for a repo" />
        </div>
      </div>
      <div class="border divide-y-1 text-sm">
        <div v-if="!recentRepos.length && query" class="px-4 py-3">
          No repos found for query "{{ query }}"
        </div>
        <!-- List most recent repos -->
        <button
          v-for="repo in recentRepos"
          @click="emit('select', repo)"
          class="w-full px-4 py-3 flex items-center justify-between gap-4 overflow-hidden hover:bg-neutral-50 hover:outline-1 group">
          <div class="flex shrink gap-2 overflow-hidden">
            <div class="truncate font-medium">
              {{ repo.full_name }}
            </div>
            <div class="shrink-0 text-neutral-500">
              {{ prettifyDate(repo.pushed_at) }}
            </div>
          </div>
          <div class="opacity-0 group-hover:opacity-100">Add to Stores</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import { computed, onMounted, ref } from 'vue'
import Combobox from '@/components/elements/Combobox.vue'
import { RepoMetadata } from '@/utils/types'
import { useUserStore } from '@/utils/userStore'
import { prettifyDate } from '@/utils/utils'

const emit = defineEmits<{ (e: 'select', repo: RepoMetadata): void }>()

const userStore = useUserStore()
const loading = ref(true)

const selectedRepoOwner = ref({ label: userStore.repoOwners[0] })

const query = ref('')
const filteredRepos = computed(() => {
  const ownerRepos = userStore.repos.filter(
    (r) => r.owner === selectedRepoOwner.value.label,
  )
  return query.value.trim()
    ? ownerRepos.filter((o) => {
        const repoName = o.full_name.replace(
          `${selectedRepoOwner.value.label}/`,
          '',
        )
        return repoName.toLowerCase().includes(query.value.toLowerCase())
      })
    : ownerRepos
})

const recentRepos = computed(() => {
  return filteredRepos.value.slice(0, 5)
})

onMounted(async () => {
  await userStore.listRepos()
  loading.value = false
  selectedRepoOwner.value = { label: userStore.repoOwners[0] }
})
</script>

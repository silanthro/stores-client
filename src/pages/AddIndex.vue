<template>
  <div class="max-w-[72rem] mx-auto h-full flex flex-col mt-24 gap-8">
    <div class="w-full flex justify-between">
      <h2>Add Index</h2>
      <button
        v-if="selectedRepo"
        @click="selectedRepo = undefined"
        class="border border border-neutral-300 text-neutral-700 px-4 py-1 hover:border-black hover:text-black">
        Back
      </button>
    </div>
    <SelectRepo v-if="!selectedRepo" @select="addRepo" />
    <SelectBranch
      v-else
      :repo="selectedRepo"
      @cancel="selectedRepo = undefined"
      @addIndex="addIndex" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SelectBranch from '@/components/SelectBranch.vue'
import SelectRepo from '@/components/SelectRepo.vue'
import { RepoMetadata } from '@/utils/types'
import { useUserStore } from '@/utils/userStore'

const selectedRepo = ref<RepoMetadata | undefined>()
function addRepo(repo: RepoMetadata) {
  selectedRepo.value = repo
}

const userStore = useUserStore()
const router = useRouter()
async function addIndex(index: RepoMetadata) {
  await userStore.addIndex(index)
  router.push(`index/${index.full_name}`)
}
</script>

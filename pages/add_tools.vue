<template>
  <div class="h-screen overflow-hidden flex flex-col">
    <Navbar />
    <div class="grow overflow-auto px-4">
      <div class="max-w-[72rem] flex flex-col gap-8 mx-auto mb-10">
        <div class="flex mt-24 items-end justify-between gap-24 w-full">
          <h2>Add Tools</h2>
          <button
            v-if="selectedRepo"
            @click="selectedRepo = undefined"
            class="border border border-neutral-300 text-neutral-700 px-4 py-1 hover:border-black hover:text-black">
            Back
          </button>
        </div>
        <SelectRepo v-if="!selectedRepo" @select="addRepo" />
        <SelectBranch v-else :repo="selectedRepo" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { RepoMetadata } from '@/utils/types/tools'

const selectedRepo = ref<RepoMetadata | undefined>()
function addRepo(repo: RepoMetadata) {
  selectedRepo.value = repo
}
</script>

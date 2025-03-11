<template>
  <div class="w-full h-full flex flex-col items-center gap-24 mb-36">
    <div class="flex flex-col items-center justify-center gap-4 mt-48">
      <h1 class="text-8xl font-bold font-display">Stores</h1>
      <div class="text-xl text-neutral-600">
        A public repository of tools for LLM agents
      </div>
    </div>
    <div class="flex flex-col w-[30rem] max-w-full px-4 mb-4">
      <label class="text-xs font-medium uppercase">Search</label>
      <div class="border-2 px-4 py-2 text-lg">
        <input type="text" placeholder="Plot a graph" />
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <RepoCard
        v-for="index in toolsStore.tool_indexes"
        :repo="index"
        @click="openRepo" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import RepoCard from '@/components/RepoCard.vue'
import { useToolsStore } from '@/utils/toolsStore'

const toolsStore = useToolsStore()

const router = useRouter()
function openRepo() {
  router.push('/repo')
}
</script>

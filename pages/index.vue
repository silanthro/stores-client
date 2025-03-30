<template>
  <div class="h-screen overflow-hidden flex flex-col">
    <Navbar />
    <div class="overflow-auto">
      <div class="max-w-[72rem] h-full flex flex-col gap-24 mb-72 mx-auto">
        <div class="flex mt-24 items-end justify-between gap-24 w-full">
          <div class="space-y-16 shrink">
            <div class="space-y-4">
              <h1>Stores</h1>
              <div class="text-xl text-neutral-500">
                A public repository of tools for LLM agents
              </div>
            </div>
            <div class="flex flex-col max-w-[30rem]">
              <div
                class="px-3 py-2 text-lg bg-neutral-100 flex items-center gap-2">
                <MagnifyingGlassIcon class="w-4 h-4 text-neutral-500" />
                <input type="text" placeholder="Plot a graph" />
              </div>
            </div>
          </div>
          <div class="grow max-w-[40rem] shrink-0">
            <CodeSnippet />
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <IndexCard
            v-for="index in toolsStore.tool_indexes"
            :repo="index"
            @click="router.push(`tools/${index.full_name}`)" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/16/solid'

const toolsStore = useToolsStore()
toolsStore.refresh()

const router = useRouter()
</script>

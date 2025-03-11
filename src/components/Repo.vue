<template>
  <div class="w-full flex items-center justify-center px-8">
    <div class="w-full max-w-[800px] flex flex-col gap-4 mt-10">
      <div class="flex items-center gap-3">
        <h2 class="text-2xl font-medium">
          {{ repo.full_name }}
        </h2>
        <DocumentDuplicateIcon class="w-6 h-6 text-neutral-400" />
      </div>
      <div class="w-full border-2 divide-y-2">
        <div class="flex">
          <button
            v-for="tab in tabs"
            class="px-4 py-2 font-medium text-sm flex items-center gap-1"
            :class="[selectedTab === tab.name ? 'bg-orange-100' : '']"
            @click="selectedTab = tab.name">
            <div class="w-4 h-4 flex items-center justify-center">
              <component :is="tab.icon" />
            </div>
            {{ tab.name }}
          </button>
        </div>
        <div class="p-6 min-h-[100px]">
          <div v-if="selectedTab === 'README'">
            <Markdown v-if="repo.readme" :markdown="repo.readme" />
            <div v-else class="text-neutral-400">No README found</div>
          </div>
          <div v-else-if="selectedTab === 'Tools'" class="flex flex-col gap-6">
            <div class="flex items-center gap-2 border border-neutral-300 p-2">
              <MagnifyingGlassIcon class="w-4 h-4 text-neutral-400" />
              <input type="text" placeholder="Search tools" />
            </div>
            <div
              v-for="tool in repo.tools"
              class="border border-neutral-300 py-2 px-3">
              <ToolDescription :tool="tool" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/16/solid'
import {
  BookOpenIcon,
  BuildingLibraryIcon,
  CodeBracketIcon,
  DocumentDuplicateIcon,
  WrenchIcon,
} from '@heroicons/vue/24/outline'
import { ref } from 'vue'
import Markdown from '@/components/Markdown.vue'
import ToolDescription from '@/components/ToolDescription.vue'
import { useToolsStore } from '@/utils/toolsStore'

const toolsStore = useToolsStore()

const repo = toolsStore.tool_indexes[0]

const tabs = [
  {
    name: 'README',
    icon: BookOpenIcon,
  },
  {
    name: 'Tools',
    icon: WrenchIcon,
  },
  {
    name: 'License',
    icon: BuildingLibraryIcon,
  },
  {
    name: 'Quickstart',
    icon: CodeBracketIcon,
  },
]

const selectedTab = ref('README')
</script>

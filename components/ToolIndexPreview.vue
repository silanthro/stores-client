<template>
  <div class="w-full border divide-y mb-36">
    <div class="flex">
      <button
        v-for="tab in tabs"
        class="px-4 py-2 font-medium text-sm flex items-center gap-1 border-b-1"
        :class="[
          selectedTab === tab.name ? ' border-black' : 'border-transparent',
        ]"
        @click="selectedTab = tab.name">
        <div class="w-4 h-4 flex items-center justify-center">
          <component :is="tab.icon" />
        </div>
        {{ tab.name }}
      </button>
    </div>
    <div class="p-6 min-h-[100px]">
      <div v-if="selectedTab === 'README'">
        <ElementsMarkdown
          v-if="props.index.readme"
          :markdown="props.index.readme" />
        <div v-else class="text-neutral-400">No README found</div>
      </div>
      <div v-else-if="selectedTab === 'Tools'" class="flex flex-col gap-6">
        <div class="flex items-center gap-2 border border-neutral-300 p-2">
          <MagnifyingGlassIcon class="w-4 h-4 text-neutral-400" />
          <input type="text" placeholder="Search tools" />
        </div>
        <div
          v-for="tool in props.index.tools"
          class="border border-neutral-300 p-6">
          <ToolDescription :tool="tool" />
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
  WrenchIcon,
} from '@heroicons/vue/24/outline'
import type { RepoMetadata } from '@/utils/types/tools'

const props = defineProps({
  index: {
    type: Object as PropType<RepoMetadata>,
    required: true,
  },
})

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

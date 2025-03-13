<template>
  <div
    class="w-full border p-6 w-96 h-48 flex flex-col gap-2 hover:outline-1 cursor-pointer">
    <div class="font-semibold text-xl">
      {{ props.repo.full_name }}
    </div>
    <div
      class="grow shrink overflow-hidden text-sm line-clamp-4 text-neutral-500">
      {{ props.repo.description || 'No description' }}
    </div>
    <div v-if="props.repo.tools">
      {{ props.repo.tools.length }} tool{{
        props.repo.tools.length === 1 ? '' : 's'
      }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { PropType } from 'vue'
import type { RepoMetadata } from '@/utils/types'

const props = defineProps({
  repo: {
    type: Object as PropType<RepoMetadata>,
    required: true,
  },
})
</script>

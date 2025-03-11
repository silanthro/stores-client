<template>
  <div class="border-2 border-r-6 border-b-6 p-4 w-96 h-48 flex flex-col gap-2">
    <h3 class="font-medium text-lg">
      {{ props.repo.full_name }}
    </h3>
    <div class="grow shrink overflow-hidden text-sm line-clamp-4">
      {{ props.repo.desc }}
    </div>
    <div>{{ props.repo.num_tools }} tools</div>
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

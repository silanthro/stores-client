<template>
  <div class="flex flex-col gap-2">
    <div class="flex flex-wrap gap-1 items-center">
      <span class="font-medium text-lg">
        {{ tool.name }}
      </span>
      (
      <span
        v-for="input in tool.inputs"
        class="border border-neutral-100 bg-neutral-50 text-md flex items-center justify-center py-0 px-1 h-min whitespace-nowrap">
        {{ input.name }}: {{ input.type
        }}{{ input.default ? ` = ${input.default}` : '' }}
      </span>
      )
      <ArrowRightIcon class="w-4 h-4" />
      <span
        class="border border-neutral-100 bg-neutral-50 text-md flex items-center justify-center py-0 px-1 h-min">
        {{ tool.output }}
      </span>
    </div>
    <div class="text-sm text-neutral-500">
      <pre class="font-sans">{{ tool.doc }}</pre>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ArrowRightIcon } from '@heroicons/vue/24/solid'
import type { ToolMetadata } from '@/utils/types/tools'

const props = defineProps({
  tool: {
    type: Object as PropType<ToolMetadata>,
    required: true,
  },
})
</script>

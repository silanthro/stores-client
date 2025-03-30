<template>
  <div>
    <a
      :href="`#${props.item.id}`"
      :class="[
        '-ml-[2px] block border-l-2 transition-colors truncate py-1',
        props.currentSectionId === props.item.id
          ? 'border-neutral-800 text-neutral-800 font-medium'
          : 'border-transparent text-neutral-400 hover:text-neutral-600',
      ]"
      :style="{ paddingLeft: `${(props.item.depth - 1.5) * 0.75}rem` }"
      >{{ props.item.text }}</a
    >
    <div v-if="props.item.children && props.item.depth < props.maxDepth">
      <DocsPageTOCItem
        v-for="c in props.item.children"
        :item="c"
        :current-section-id="props.currentSectionId"
        :max-depth="props.maxDepth" />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TOCLink } from '@/utils/types/docs'

const props = defineProps<{
  item: TOCLink
  currentSectionId: string
  maxDepth: number
}>()
</script>

<template>
  <aside
    class="w-64 border-r border-neutral-200 h-[calc(100vh-60px)] sticky top-14">
    <nav class="p-4 overflow-y-auto h-full">
      <NuxtLink :to="props.headingLink" class="px-2 py-1 font-semibold text-lg">
        {{ props.heading }}
      </NuxtLink>
      <ul class="space-y-1 pt-4">
        <DocsSidebarItem
          v-for="item in toc"
          :item="item"
          class="font-medium text-sm" />
      </ul>
    </nav>
  </aside>
</template>
<script setup lang="ts">
import DocsSidebarItem from './DocsSidebarItem.vue'
import type { Article } from '@/utils/types/docs'

const props = defineProps({
  heading: String,
  headingLink: String,
  // List of nested Articles
  articles: {
    type: Array as PropType<Article[]>,
    default: [],
  },
  // This should be a Collection referenced by the TOC markdown
  collectionName: {
    type: String,
    default: null,
  },
  // This should be a Collection containing the TOC markdown
  collectionTOC: {
    type: String,
    default: null,
  },
})

const { data: toc } = await useAsyncData(() => {
  if (props.collectionName && props.collectionTOC) {
    return parseTOC(props.collectionTOC, props.collectionName)
  } else {
    return new Promise((resolve) => resolve(props.articles || []))
  }
})
</script>

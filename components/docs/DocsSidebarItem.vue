<template>
  <li
    class="px-2 py-1"
    :class="[path === props.item.link ? 'text-neutral-800' : '']">
    <NuxtLink
      :to="getNestedLink(props.item)"
      :class="[
        props.item.link ? 'hover:text-neutral-800 transition-colors' : '',
      ]"
      @click="$emit('click')"
      >{{ props.item.label }}</NuxtLink
    >
    <ul
      v-if="props.item.children"
      class="pt-1 space-y-0 ml-1 font-normal text-neutral-500 normal-case">
      <DocsSidebarItem v-for="c in props.item.children" :item="c" class="" @click="$emit('click')" />
    </ul>
  </li>
</template>
<script setup lang="ts">
import type { Article } from '@/utils/types/docs'

const path = computed(() => useRoute().fullPath)

const props = defineProps<{
  item: Article
}>()

defineEmits(['click'])

function getNestedLink(item: Article): string | undefined {
  // Return Article.link if available
  // Otherwise recursively return link of first child
  if (item.link) return item.link
  if (item.children && item.children.length)
    return getNestedLink(item.children[0])
  return undefined
}
</script>

<template>
  <!-- Mobile sidebar -->
  <aside class="z-10 md:hidden w-full">
    <nav class="relative w-full">
      <Menu>
        <MenuButton class="px-4 py-3 w-full border-b border-neutral-200">
          <span class="text-sm flex flex-row items-center gap-1"
            ><Bars3Icon class="w-4 h-4" />{{ props.heading }}</span
          >
        </MenuButton>
        <MenuItems
          class="relative left-0 top-full w-full bg-white border border-neutral-200 p-4 space-y-1">
          <MenuItem v-slot="{ close }" as="div">
            <NuxtLink
              :to="props.headingLink"
              class="px-1 py-1 font-semibold"
              @click="close">
              {{ props.heading }}
            </NuxtLink>
          </MenuItem>
          <ul class="-ml-1">
            <li v-for="item in toc">
              <MenuItem v-slot="{ close }">
                <DocsSidebarItem
                  :item="item"
                  class="font-medium text-sm"
                  @click="close" />
              </MenuItem>
            </li>
          </ul>
        </MenuItems>
      </Menu>
    </nav>
  </aside>
  <!-- Desktop sidebar -->
  <aside
    class="hidden md:block w-64 border-r border-neutral-200 h-[calc(100vh-60px)] sticky top-14">
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
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'
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

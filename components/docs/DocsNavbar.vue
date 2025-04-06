<template>
  <div
    class="z-10 w-full bg-white flex justify-between items-center py-1 px-10 border-b border-neutral-200">
    <div class="flex items-center text-sm">
      <NuxtLink
        to="/docs"
        class="px-2 py-1 font-semibold text-xs uppercase font-display rounded bg-neutral-100">
        Docs
      </NuxtLink>
      <NuxtLink
        :to="page.link"
        v-for="page in pages"
        class="px-4 py-2 hover:underline">
        {{ page.name }}
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'

const router = useRouter()
const userStore = useUserStore()

const pages = [
  {
    name: 'Quickstart',
    link: '/docs/quickstarts',
  },
  {
    name: 'Guide',
    link: '/docs/guide',
  },
  {
    name: 'Cookbook',
    link: '/docs/cookbook',
  },
  {
    name: 'Contribute',
    link: '/docs/contribute',
  },
]
</script>

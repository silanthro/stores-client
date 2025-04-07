<template>
  <div
    class="shrink-0 w-full bg-white flex items-center py-1 px-4 md:px-10 border-b border-neutral-200 text-sm overflow-auto">
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
</template>
<script setup lang="ts">
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

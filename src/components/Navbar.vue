<template>
  <div class="w-full flex justify-between p-4">
    <div class="px-4 py-2 font-medium text-lg">Stores</div>
    <div class="flex">
      <RouterLink
        :to="page.link"
        v-for="page in pages"
        class="px-4 py-2 hover:underline">
        {{ page.name }}
      </RouterLink>
    </div>
  </div>
</template>
<script setup lang="ts">
const pages = [
  {
    name: 'How to use',
    link: '/',
  },
  {
    name: 'Contribute',
    link: '/',
  },
]
</script>

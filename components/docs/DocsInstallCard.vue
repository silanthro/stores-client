<template>
  <div class="block space-y-4 border p-4">
    <div class="prose prose-neutral w-full max-w-3xl h-max">
      <ContentRenderer
        id="post-container"
        :value="installContent as InstallCollectionItem"
        class="post-content space-y-4" />
    </div>
  </div>
</template>
<style scoped>
h1 {
  color: red;
}
</style>
<script setup lang="ts">
import type { InstallCollectionItem } from '@nuxt/content'

const { data: installContent } = await useAsyncData(() => {
  return queryCollection('install').first()
})
</script>

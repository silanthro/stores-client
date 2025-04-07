<template>
  <div class="h-screen overflow-hidden flex flex-col">
    <Navbar />
    <div class="w-full overflow-auto px-4">
      <div class="prose prose-neutral my-36 mx-auto">
        <ContentRenderer v-if="content" :value="content" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { data: content } = await useAsyncData(() => {
  return queryCollection('about').first()
})
</script>

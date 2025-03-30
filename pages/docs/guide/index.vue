<template>
  <div
    v-if="post"
    class="relative flex justify-center gap-16 pt-8 mx-auto h-full overflow-auto">
    <div class="relative prose prose-neutral w-full max-w-3xl mb-36 h-max">
      <ContentRenderer
        id="post-container"
        :value="post"
        class="post-content space-y-4" />
    </div>
  </div>
</template>
<script setup lang="ts">
const { data: post } = await useAsyncData(() => {
  return queryCollection('guide').path('/docs/guide').first()
})
</script>

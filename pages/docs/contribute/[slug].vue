<template>
  <div
    v-if="post"
    class="relative flex justify-center gap-16 md:pt-4 h-full overflow-auto">
    <div class="relative prose prose-neutral w-full max-w-3xl mb-36 h-max">
      <div class="hidden md:flex w-full justify-end pb-4">
        <DocsCopyDocButton :content="post.rawbody.replaceAll('\\n', '\n')" />
      </div>
      <ContentRenderer id="post-container" :value="post" class="post-content" />
    </div>
    <DocsPageTOC :toc="post.body.toc" />
  </div>
</template>
<script setup lang="ts">
const { data: post } = await useAsyncData(() => {
  return queryCollection('contribute').first()
})
</script>

<template>
  <div
    v-if="post"
    class="relative flex justify-center gap-16 pt-4 pb-16 md:pt-4 px-4 h-full overflow-auto">
    <div class="relative prose prose-neutral w-full max-w-3xl h-max">
      <div class="hidden md:flex w-full justify-end pb-4">
        <DocsCopyDocButton :content="post.rawbody.replaceAll('\\n', '\n')" />
      </div>
      <ContentRenderer id="post-container" :value="post" class="post-content" />
    </div>
    <DocsPageTOC :toc="post.body.toc" />
  </div>
</template>
<style scoped>
div {
  scroll-behavior: smooth;
}
</style>
<script setup lang="ts">
const slug = useRoute().params.slug
const { data: post } = await useAsyncData(() => {
  return queryCollection('quickstarts')
    .path(`/docs/quickstarts/${slug}`)
    .first()
})

useSeoMeta({
  title: post.value?.title,
  description: post.value?.description,
})
</script>

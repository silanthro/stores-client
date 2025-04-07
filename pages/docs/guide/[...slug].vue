<template>
  <div
    v-if="post"
    class="relative flex justify-center gap-16 pt-4 pb-16 px-4 h-full overflow-auto">
    <div class="relative prose prose-neutral w-full max-w-3xl mb-36 h-max">
      <div class="hidden md:flex w-full justify-end pb-4">
        <DocsCopyDocButton :content="post.rawbody.replaceAll('\\n', '\n')" />
      </div>
      <ContentRenderer
        id="post-container"
        :value="post"
        class="post-content" />
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
let slug = useRoute().params.slug
const { data: post } = await useAsyncData(() => {
  if (typeof slug != 'string') {
    slug = slug.join('/')
  }
  return queryCollection('guide').path(`/docs/guide/${slug}`).first()
})

useSeoMeta({
  title: post.value?.title,
  description: post.value?.description,
})
</script>

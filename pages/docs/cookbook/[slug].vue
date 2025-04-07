<template>
  <div
    v-if="recipe"
    class="relative flex justify-center gap-16 pt-4 pb-16 md:pt-4 px-4 h-full overflow-auto">
    <div class="relative prose prose-neutral w-full max-w-3xl h-max">
      <div class="hidden md:flex w-full justify-end pb-4">
        <DocsCopyDocButton :content="recipe.rawbody.replaceAll('\\n', '\n')" />
      </div>
      <ContentRenderer
        id="post-container"
        :value="recipe"
        class="post-content" />
    </div>
    <DocsPageTOC :toc="recipe.body.toc" />
  </div>
</template>

<script setup lang="ts">
const slug = useRoute().params.slug
const { data: recipe } = await useAsyncData(() => {
  return queryCollection('cookbook').path(`/docs/cookbook/${slug}`).first()
})

useSeoMeta({
  title: recipe.value?.title,
  description: recipe.value?.description,
})
</script>

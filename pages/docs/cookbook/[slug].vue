<template>
  <div
    v-if="recipe"
    class="relative flex justify-center gap-16 pt-4 pb-16 px-4 h-full overflow-auto">
    <div class="relative prose prose-neutral w-full max-w-3xl mb-36 h-max">
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

const host = ref('https://stores-tools.vercel.app')
if (import.meta.client) {
  host.value = window.location.protocol + '//' + window.location.host
}

useSeoMeta({
  title: recipe.value?.title,
  ogTitle: recipe.value?.title,
  description: recipe.value?.description,
  ogDescription: recipe.value?.description,
  ogImage: recipe.value?.meta?.image
    ? `${host.value}${recipe.value?.meta?.image}`
    : undefined,
  twitterCard: 'summary_large_image',
})
</script>

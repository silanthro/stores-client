<template>
  <div
    v-if="post"
    class="w-full pt-16 h-full overflow-auto">
    <div class="w-full max-w-6xl flex flex-col mx-auto items-center gap-4">
      <NuxtLink
      to="/blog" class="w-full flex justify-start items-center mb-4 no-underline gap-1 text-neutral-500 hover:text-neutral-700">
        <ChevronLeftIcon class="w-4 h-4" />
        <div class="text-sm">
          Blog
        </div>
      </NuxtLink>
      <div class="relative prose prose-neutral w-full max-w-3xl mb-36 h-max">
        <ContentRenderer id="post-container" :value="post" class="post-content" />
      </div>
    </div>
  </div>
</template>  

<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
const slug = useRoute().params.slug
const { data: post } = await useAsyncData(() => {
  return queryCollection('blog').path(`/blog/${slug}`).first()
})

useSeoMeta({
  title: post.value?.title,
  description: post.value?.description,
})
</script>

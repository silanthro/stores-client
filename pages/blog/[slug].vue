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
      <div class="relative prose prose-neutral w-full mb-36 h-max">
        <div class="flex flex-col gap-6">
          <div class="text-sm flex items-center gap-4">
            <span>{{ format(new Date(post.updatedAt), 'MMMM dd, yyyy') }}</span>
            <span v-for="tag in post.meta?.tags" :key="tag" class="text-neutral-400">{{ tag }}</span>
          </div>
          <h1 class="text-5xl! font-medium! tracking-tight mb-2">{{ post.title }}</h1>
          <span class="text-lg text-neutral-500">{{ post.description }}</span>
          <div class="-mx-20">
            <img v-if="post.meta?.coverImg" :src="String(post.meta.coverImg)" :alt="String(post.meta.coverAlt)" class="w-full" />
          </div>
        </div>
        <ContentRenderer id="post-container" :value="post" class="post-content" />
      </div>
    </div>
  </div>
</template>  

<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import { format } from 'date-fns'
const slug = useRoute().params.slug
const { data: post } = await useAsyncData(() => {
  return queryCollection('blog').path(`/blog/${slug}`).first()
})

useSeoMeta({
  title: post.value?.title,
  description: post.value?.description,
})
</script>

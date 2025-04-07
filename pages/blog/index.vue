<template>
  <div class="h-full overflow-auto px-4">
    <div class="max-w-3xl mx-auto py-8 mb-36">
      <h1 class="text-3xl! mb-8">Blog</h1>
      <div class="grid grid-cols-1 gap-8">
        <!-- Latest Post -->
        <NuxtLink
          v-if="latestPost"
          :key="latestPost.id"
          :to="`/blog/${latestPost.id}`"
          class="flex flex-col justify-between gap-2 p-6 text-left bg-white border border-neutral-200 rounded-lg hover:border-neutral-500 hover:shadow-md transition-all">
          <div class="flex flex-col gap-2 mb-2">
            <img
              :src="latestPost.coverImg"
              :alt="latestPost.coverAlt"
              class="w-full object-cover rounded-lg mb-2" />
            <span class="text-xs text-neutral-400">
              {{ latestPost.tags[0] }}
            </span>
            <h3 class="text-2xl! font-semibold">
              {{ latestPost.title }}
            </h3>
            <p class="text-sm text-neutral-600">
              {{ latestPost.description }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <img
              :src="latestPost.author.img"
              :alt="latestPost.author.name"
              class="w-8 h-8 rounded-full" />
            <div>
              <p class="text-sm text-neutral-600">
                {{ latestPost.author.name }}
              </p>
              <p class="text-xs text-neutral-400">
                {{ latestPost.author.title }}
              </p>
            </div>
          </div>
        </NuxtLink>

        <!-- Remaining Posts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <NuxtLink
            v-for="post in remainingPosts"
            :key="post.id"
            :to="`/blog/${post.id}`"
            class="p-6 text-left bg-white border border-neutral-200 rounded-lg hover:border-neutral-500 hover:shadow-md transition-all">
            <div class="flex flex-col gap-1 mb-2">
              <span class="text-xs text-neutral-400">
                {{ post.tags[0] }}
              </span>
              <h3 class="text-xl! font-semibold">
                {{ post.title }}
              </h3>
              <p class="text-sm text-neutral-600 line-clamp-2">
                {{ post.description }}
              </p>
            </div>
            <div class="flex items-center gap-3 mt-4">
              <img
                :src="post.author.img"
                :alt="post.author.name"
                class="w-6 h-6 rounded-full" />
              <div>
                <p class="text-xs text-neutral-600">
                  {{ post.author.name }}
                </p>
                <p class="text-xs text-neutral-400">
                  {{ post.author.title }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: allPosts } = await useAsyncData(() => {
  return queryCollection('blog').order('updatedAt', 'DESC').all()
})

const posts = computed(() => {
  if (!allPosts.value) return []
  return allPosts.value.map((b) => {
    return {
      id: b.stem.split('/').slice(-1)[0],
      title: (b.title as string) || '',
      description: (b.description as string) || '',
      author:
        (b.meta.author as { name: string; title: string; img: string }) || '',
      coverImg: (b.meta.coverImg as string) || '',
      coverAlt: (b.meta.coverAlt as string) || '',
      tags: (b.meta.tags as string[]) || [],
      createdAt: (b.meta.createdAt as Date) || new Date(),
      updatedAt: (b.meta.updatedAt as Date) || new Date(),
    }
  })
})

const latestPost = computed(() => {
  return posts.value[0]
})

const remainingPosts = computed(() => {
  return posts.value.slice(1)
})
</script>

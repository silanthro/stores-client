<template>
  <div
    class="max-w-6xl mx-auto pt-4 pb-16 md:py-8 px-4 md:px-8 h-full overflow-auto">
    <h1 class="text-3xl! mb-8">Cookbook</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="recipe in recipes"
        :key="recipe.id"
        :to="`/docs/cookbook/${recipe.id}`"
        class="flex flex-col justify-between gap-2 p-6 text-left bg-white border border-neutral-200 hover:border-neutral-500 hover:shadow-md transition-all">
        <div class="flex flex-col gap-2">
          <span class="text-xs text-neutral-400">
            {{ recipe.tags[0] }}
          </span>
          <h3 class="text-xl! font-semibold">
            {{ recipe.title }}
          </h3>
          <p class="text-sm text-neutral-600 line-clamp-2">
            {{ recipe.description }}
          </p>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: allRecipes } = await useAsyncData(() => {
  return queryCollection('cookbook').order('updatedAt', 'DESC').all()
})

const recipes = computed(() => {
  if (!allRecipes.value) return []
  return allRecipes.value.map((b) => {
    return {
      id: b.stem.split('/').slice(-1)[0],
      title: (b.title as string) || '',
      description: (b.description as string) || '',
      tags: (b.meta.tags as string[]) || [],
      updatedAt: (b.updatedAt as Date) || new Date(),
    }
  })
})
</script>

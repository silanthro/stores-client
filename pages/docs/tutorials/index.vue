<template>
  <div class="max-w-6xl mx-auto p-8 h-full overflow-auto">
    <h1 class="docs mb-8">Quickstarts</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="tutorial in tutorials"
        :key="tutorial.id"
        :to="`/docs/tutorials/${tutorial.id}`"
        class="p-6 text-left bg-white border border-neutral-200 rounded-lg hover:border-neutral-500 hover:shadow-md transition-all">
        <div class="flex items-center gap-3 mb-2">
          <img
            :src="`/img/logos/${tutorial.logo}`"
            :alt="`${tutorial.title} logo`"
            class="w-6 h-6 object-contain rounded" />
          <h3 class="docs text-lg font-semibold">
            {{ tutorial.section }} {{ tutorial.title }}
          </h3>
        </div>
        <p class="text-sm text-neutral-600">
          Learn how to add tools to your {{ tutorial.section }} agents with
          Stores
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
const { data: allTutorials } = await useAsyncData(() => {
  return queryCollection('tutorials').all()
})
const tutorials = computed(() => {
  if (!allTutorials.value) return []
  return allTutorials.value.map((t) => {
    return {
      id: t.stem.split('/').slice(-1)[0],
      title: (t.meta.short_title as string) || '',
      section: (t.meta.package as string) || '',
      logo: t.meta.package
        ? (t.meta.package as string).toLowerCase() + '.jpg'
        : '',
    }
  })
})
</script>

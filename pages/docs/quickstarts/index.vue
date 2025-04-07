<template>
  <div class="max-w-6xl mx-auto pb-16 md:py-8 md:px-8 h-full overflow-auto">
    <h1 class="text-3xl! mb-8">Quickstarts</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="quickstart in quickstarts"
        :key="quickstart.id"
        :to="`/docs/quickstarts/${quickstart.id}`"
        class="p-6 text-left bg-white border border-neutral-200 hover:border-neutral-500 hover:shadow-md transition-all">
        <div class="flex items-center gap-3 mb-2">
          <img
            :src="`/img/logos/${quickstart.logo}`"
            :alt="`${quickstart.title} logo`"
            class="w-6 h-6 object-contain rounded" />
          <h3 class="text-xl! font-semibold">
            {{ quickstart.section }} {{ quickstart.title }}
          </h3>
        </div>
        <p class="text-sm text-neutral-600">
          Learn how to add tools to your {{ quickstart.section }} agents with
          Stores
        </p>
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
const { data: allQuickstarts } = await useAsyncData(() => {
  return queryCollection('quickstarts').order('order', 'ASC').all()
})
const quickstarts = computed(() => {
  if (!allQuickstarts.value) return []
  return allQuickstarts.value.map((t) => {
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

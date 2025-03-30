<template>
  <div class="flex h-full">
    <DocsSidebar
      heading="Quickstart"
      heading-link="/docs/tutorials"
      :articles="articles" />
    <div class="grow">
      <NuxtPage />
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
      label: (t.meta.short_title as string) || '',
      title: (t.meta.short_title as string) || '',
      link: `/docs/tutorials/${t.stem.split('/').slice(-1)[0]}`,
      section: (t.meta.package as string) || '',
    }
  })
})

const articles = computed(() =>
  Array.from(new Set(tutorials.value.map((t) => t.section))).map((s) => ({
    id: s,
    label: s,
    title: s,
    children: tutorials.value.filter((t) => t.section === s),
  })),
)
</script>

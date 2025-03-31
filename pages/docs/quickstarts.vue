<template>
  <div class="flex h-full">
    <DocsSidebar
      heading="Quickstart"
      heading-link="/docs/quickstarts"
      :articles="articles" />
    <div class="grow">
      <NuxtPage />
    </div>
  </div>
</template>
<script setup lang="ts">
const { data: allQuickstarts } = await useAsyncData(() => {
  return queryCollection('quickstarts').all()
})
const quickstarts = computed(() => {
  if (!allQuickstarts.value) return []
  return allQuickstarts.value.map((t) => {
    return {
      id: t.stem.split('/').slice(-1)[0],
      label: (t.meta.short_title as string) || '',
      title: (t.meta.short_title as string) || '',
      link: `/docs/quickstarts/${t.stem.split('/').slice(-1)[0]}`,
      section: (t.meta.package as string) || '',
    }
  })
})

const articles = computed(() =>
  Array.from(new Set(quickstarts.value.map((t) => t.section))).map((s) => ({
    id: s,
    label: s,
    title: s,
    children: quickstarts.value.filter((t) => t.section === s),
  })),
)
</script>

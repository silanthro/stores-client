<template>
  <aside
    class="w-64 border-r border-neutral-200 h-[calc(100vh-60px)] sticky top-14">
    <nav class="py-8 px-10 overflow-y-auto h-full">
      <NuxtLink
        to="/docs/tutorials"
        class="px-2 py-1 font-semibold text-lg cursor-pointer">
        Quickstarts
      </NuxtLink>
      <ul class="space-y-1">
        <template v-for="section in sections" :key="section">
          <li
            class="px-2 pt-5 pb-1 font-medium text-xs text-neutral-800 uppercase">
            {{ section }}
          </li>
          <NuxtLink
            v-for="tutorial in getTutorialsBySection(section)"
            :key="tutorial.id"
            :class="[
              'block px-5 transition-colors',
              tutorial.id === slug
                ? 'font-medium'
                : 'text-neutral-500 hover:text-neutral-800',
            ]"
            :to="`/docs/tutorials/${tutorial.id}`">
            {{ tutorial.title }}
          </NuxtLink>
        </template>
      </ul>
    </nav>
  </aside>
</template>
<script setup lang="ts">
const slug = computed(() => useRoute().params.slug)

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

const sections = computed(() =>
  Array.from(new Set(tutorials.value.map((t) => t.section))),
)

const getTutorialsBySection = (section: string) =>
  tutorials.value.filter((t) => t.section === section)
</script>

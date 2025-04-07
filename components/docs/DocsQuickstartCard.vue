<template>
  <div class="block space-y-4 border p-4">
    <NuxtLink to="/docs/quickstarts" class="block">
      <h2>Quickstart</h2>
    </NuxtLink>
    <div>
      <p>
        Get started immediately with any complimentary LLM provider or library
      </p>
    </div>
    <div class="flex gap-2">
      <NuxtLink
        v-for="quickstart in quickstarts"
        :key="quickstart.id"
        :to="`/docs/quickstarts/${quickstart.id}`"
        :title="quickstart.section"
        class="p-1 sm:p-2 md:p-4 bg-white border border-neutral-200 hover:border-neutral-500 transition-border">
        <img
          :src="`/img/logos/${quickstart.logo}`"
          :alt="`${quickstart.title} logo`"
          class="w-10 h-10 object-contain rounded" />
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import { uniqBy } from '@/utils/utils'

const { data: allQuickstarts } = await useAsyncData(() => {
  return queryCollection('quickstarts').order('order', 'ASC').all()
})
const quickstarts = computed(() => {
  if (!allQuickstarts.value) return []
  return uniqBy(allQuickstarts.value, (t: any) => t.meta.package).map((t) => {
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

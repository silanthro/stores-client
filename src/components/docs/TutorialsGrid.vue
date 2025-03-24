<!-- TutorialsGrid.vue -->
<template>
  <div class="max-w-6xl mx-auto p-8">
    <h1 class="docs mb-8">Quickstarts</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <button
        v-for="tutorial in props.tutorials"
        :key="tutorial.id"
        @click="$emit('select-tutorial', tutorial.id)"
        class="p-6 text-left bg-white border border-neutral-200 rounded-lg hover:border-neutral-500 hover:shadow-md transition-all"
      >
        <div class="flex items-center gap-3 mb-2">
          <img 
            :src="`/img/logos/${tutorial.filename}`" 
            :alt="`${tutorial.title} logo`"
            class="w-6 h-6 object-contain rounded"
          />
          <h3 class="docs text-lg font-semibold">{{ tutorial.section }} {{ tutorial.title }}</h3>
        </div>
        <p class="text-sm text-neutral-600">
          Learn how to add tools to your {{ tutorial.section }} agents with Stores
        </p>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TutorialGridProps, Tutorial } from '@/utils/types'

const props = defineProps<TutorialGridProps>()

defineEmits<{
  (e: 'select-tutorial', id: string): void
}>()

const sections = computed(() => {
  return [...new Set(props.tutorials.map(t => t.section))].sort()
})

const tutorialsBySection = computed(() => {
  return props.tutorials.reduce((acc: Record<string, Tutorial[]>, tutorial) => {
    if (!acc[tutorial.section]) {
      acc[tutorial.section] = []
    }
    acc[tutorial.section].push(tutorial)
    return acc
  }, {})
})
</script>

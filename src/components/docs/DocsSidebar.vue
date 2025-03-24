<!-- DocsSidebar.vue -->
<template>
  <aside class="w-64 border-r border-neutral-200 h-[calc(100vh-60px)] sticky top-14">
    <nav class="py-8 px-10 overflow-y-auto h-full">
      <p @click="$emit('select-tutorial', null)" class="px-2 py-1 font-semibold text-lg cursor-pointer">
        Quickstarts
      </p>
      <ul class="space-y-1">
        <template v-for="section in sections" :key="section">
          <li class="px-2 pt-5 pb-1 font-medium text-xs text-neutral-800 uppercase">{{ section }}</li>
          <li 
            v-for="tutorial in getTutorialsBySection(section)" 
            :key="tutorial.id"
            :class="[
              'px-5 rounded-md cursor-pointer transition-colors',
              tutorial.id === props.activeTutorial?.id 
                ? 'font-medium'
                : 'text-neutral-500 hover:text-neutral-800'
            ]"
            @click="$emit('select-tutorial', tutorial.id)"
          >
            {{ tutorial.title }}
          </li>
        </template>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DocsSidebarProps, Tutorial } from '@/utils/types'

const props = defineProps<DocsSidebarProps>()

defineEmits<{
  (e: 'select-tutorial', id: string | null): void
}>()

const sections = computed(() => 
  Array.from(new Set(props.tutorials.map(t => t.section)))
)

const getTutorialsBySection = (section: string) => 
  props.tutorials.filter(t => t.section === section)
</script>

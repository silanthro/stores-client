<!-- TableOfContents.vue -->
<template>
  <div class="w-64 py-8 border-l border-neutral-200 h-[calc(100vh-60px)] sticky top-14">
    <div class="overflow-y-auto h-full">
      <p class="text-sm font-semibold px-8 mb-4">On this page</p>
      <nav class="space-y-1">
        <a 
          v-for="heading in headings" 
          :key="heading.id"
          :href="`#${heading.id}`"
          :class="[
            'block px-8 border-l-2 transition-colors',
            activeId === heading.id 
              ? 'border-neutral-800 text-neutral-800 font-medium' 
              : 'border-transparent text-neutral-400 hover:text-neutral-600'
          ]"
          @click.prevent="scrollToSection(heading.id)"
        >
          {{ heading.text }}
        </a>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Heading } from '@/utils/types'

const router = useRouter()
const route = useRoute()
const props = defineProps<{
  content: string
}>()

const headings = ref<Heading[]>([])
const activeId = ref<string>('')
let observer: IntersectionObserver | null = null

const extractHeadings = (content: string) => {
  // Split content by code blocks, preserving the code blocks in the array
  const parts = content.split(/(```(?:\w+)?\n[\s\S]*?\n```)/g)
  const headingRegex = /^(#{2})\s+(.+)$/gm
  const headings: Heading[] = []
  
  // Look for headings in non-code-block parts (even indices)
  parts.forEach((part, index) => {
    if (index % 2 === 0) {
      const matches = Array.from(part.matchAll(headingRegex))
      headings.push(
        ...matches.map((match) => {
          const level = match[1].length
          const text = match[2].trim()
          const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
          
          return { id, text, level }
        })
      )
    }
  })
  
  return headings
}

const scrollToSection = async (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeId.value = id
    await router.replace({
      hash: `#${id}`
    })
  }
}

const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      })
    },
    {
      rootMargin: '-80px 0px -80% 0px'
    }
  )

  // Observe all headings
  headings.value.forEach((heading) => {
    const element = document.getElementById(heading.id)
    if (element) {
      observer?.observe(element)
    }
  })
}

watch(() => props.content, (newContent) => {
  headings.value = extractHeadings(newContent)
  // Wait for Vue to update the DOM before setting up the observer
  nextTick(() => {
    if (observer) {
      observer.disconnect()
    }
    setupIntersectionObserver()
  })
}, { immediate: true })

onMounted(() => {
  // Check if there's a hash in the URL and highlight that section
  if (route.hash) {
    const id = route.hash.slice(1)
    activeId.value = id
  }
  setupIntersectionObserver()
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

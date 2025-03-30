<template>
  <div v-if="props.toc" class="w-56 sticky top-0 hidden xl:block">
    <div
      class="pb-8 max-h-[calc(100vh-60px)] overflow-y-auto"
      v-if="props.toc.links.length">
      <p class="uppercase text-neutral-600 pr-6 mb-4">On this page</p>
      <nav class="space-y-1 border-l-2 border-neutral-200">
        <DocsPageTOCItem
          v-for="heading in headings"
          :item="heading"
          :current-section-id="currentSectionId"
          :max-depth="maxDepth" />
      </nav>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { MarkdownRoot } from '@nuxt/content'
import type { TOCLink } from '@/utils/types/docs'

const props = defineProps({
  toc: {
    type: Object as PropType<MarkdownRoot['toc']>,
    default: null,
  },
})

const maxDepth = 3

const headings = computed(() => {
  if (!props.toc) return []
  return props.toc.links
})

// Init IntersectionObserver and monitor which section is active
const currentSectionId = ref('')
let observer: IntersectionObserver | null = null
function getNestedLinks(links: TOCLink[]): TOCLink[] {
  return links.concat(
    ...links.map((l) => (l.children ? getNestedLinks(l.children) : [])),
  )
}
const allTOCLinks = computed(() => {
  if (!props.toc) return []
  else return getNestedLinks(props.toc.links) || []
})
watch(
  allTOCLinks,
  async (allTOCLinks) => {
    if (!import.meta.client) return
    if (observer) observer.disconnect()
    if (!allTOCLinks.length) return
    const interval = setInterval(() => {
      const loaded = document.getElementById(allTOCLinks[0].id)
      if (!loaded) return
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            currentSectionId.value = entry.target.id
          }
        })
      })
      allTOCLinks.forEach((l) => {
        const element = document.getElementById(l.id)
        if (element) {
          observer?.observe(element)
        }
      })
      clearInterval(interval)
    }, 100)
  },
  { immediate: true },
)

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

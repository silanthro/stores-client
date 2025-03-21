<!-- Docs.vue -->
<template>
  <div class="flex mt-14 min-h-[calc(100vh-60px)] bg-white">
    <DocsSidebar 
      :tutorials="tutorials"
      :activeTutorial="activeTutorial"
      @select-tutorial="(id: string | null) => id ? selectTutorial(id) : navigateToGrid()"
    />
    <div v-if="showTutorialsGrid" class="flex-1 overflow-y-auto">
      <TutorialsGrid 
        :tutorials="tutorials"
        @select-tutorial="selectTutorial"
      />
    </div>
    <template v-else>
      <div class="relative flex flex-row justify-center gap-16 flex-1 pt-8 px-24 mx-auto">
        <div class="overflow-y-auto h-[calc(100vh-90px)]">
          <div class="relative prose prose-neutral w-full max-w-3xl
            prose-h1:text-3xl! prose-h1:w-4/5
            prose-h2:text-2xl!
            prose-h3:text-lg!
            prose-headings:font-semibold 
            prose-headings:scroll-mt-22
            prose-a:text-neutral-600 prose-a:hover:text-neutral-500
            prose-code:before:content-none prose-code:after:content-none"
          >
          <button 
            @click="copyFullTutorial"
            class="px-2 py-1 text-sm text-center bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors absolute right-0 top-0"
          >
            <span v-if="copySuccess" class="flex flex-row items-center gap-2"><CheckCircleIcon class="w-4 h-4" /> Copied!</span>
            <span v-else class="flex flex-row items-center gap-2"><DocumentDuplicateIcon class="w-4 h-4" /> Copy for LLM</span>
          </button>
            <div class="markdown-content">
              <template v-for="(node, index) in renderedContent" :key="`${currentTutorialId}-${index}`">
                <component 
                  v-if="typeof node === 'object'" 
                  :is="node" 
                />
                <div 
                  v-else 
                  v-html="node" 
                  class="markdown-html"
                />
              </template>
            </div>
          </div>
        </div>
        <TableOfContents :content="tutorialContent" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { Ref, ComputedRef } from 'vue'
import DocsSidebar from '@/components/docs/DocsSidebar.vue'
import TableOfContents from '@/components/docs/TableOfContents.vue'
import TutorialsGrid from '@/components/docs/TutorialsGrid.vue'
import CodeBlock from '@/components/docs/CodeBlock.vue'
import { loadTutorial, parseMarkdown } from '@/utils/markdown-renderer'
import type { Tutorial } from '@/utils/types'
import { CheckCircleIcon, DocumentDuplicateIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

const tutorials: Ref<Tutorial[]> = ref([
  { id: 'openai-chat', title: 'Chat Completions', section: 'OpenAI', filename: 'openai.svg' },
  { id: 'openai-responses', title: 'Responses', section: 'OpenAI', filename: 'openai.svg' },
  { id: 'anthropic', title: 'Claude', section: 'Anthropic', filename: 'anthropic.jpg' },
  { id: 'google-gemini-auto', title: 'Gemini (Auto)', section: 'Google', filename: 'google-gemini.png' },
  { id: 'google-gemini-manual', title: 'Gemini (Manual)', section: 'Google', filename: 'google-gemini.png' },
  // { id: 'langchain-basic', title: 'Basic Usage', section: 'LangChain', filename: 'langchain.jpg' },
  { id: 'langchain-tools', title: 'Tool Calling', section: 'LangChain', filename: 'langchain.jpg' },
  { id: 'langgraph', title: 'Agent', section: 'LangChain', filename: 'langchain.jpg' },
  // { id: 'litellm-basic', title: 'Basic Usage', section: 'LiteLLM', filename: 'litellm.jpg' },
  { id: 'litellm-tools', title: 'Tool Calling', section: 'LiteLLM', filename: 'litellm.jpg' },
  // { id: 'llamaindex-basic', title: 'Basic Usage', section: 'LlamaIndex', filename: 'llamaindex.jpg' },
  { id: 'llamaindex-agent', title: 'Agent', section: 'LlamaIndex', filename: 'llamaindex.jpg' }
])

const currentTutorialId: Ref<string | null> = ref(null)
const copySuccess: Ref<boolean> = ref(false)
const tutorialContent: Ref<string> = ref('')

const showTutorialsGrid = computed(() => !currentTutorialId.value)

const activeTutorial: ComputedRef<Tutorial | undefined> = computed(() => {
  return tutorials.value.find((t: Tutorial) => t.id === currentTutorialId.value)
})

const renderedContent = computed(() => {
  return parseMarkdown(tutorialContent.value)
})

const selectTutorial = async (tutorialId: string): Promise<void> => {
  currentTutorialId.value = tutorialId
  await router.push({ name: 'Tutorial', params: { tutorialId } })
  await loadTutorialContent()
}

const navigateToGrid = async (): Promise<void> => {
  currentTutorialId.value = null
  await router.push({ name: 'Docs' })
}

const copyFullTutorial = async (): Promise<void> => {
  try {
    await navigator.clipboard.writeText(tutorialContent.value)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const loadTutorialContent = async (): Promise<void> => {
  
  if (currentTutorialId.value) {
    tutorialContent.value = await loadTutorial(currentTutorialId.value)
  }
}

onMounted(async () => {
  const tutorialId = route.params.tutorialId as string | undefined
  if (tutorialId && tutorials.value.some(t => t.id === tutorialId)) {
    await selectTutorial(tutorialId)
  } else {
    currentTutorialId.value = null
  }
})

watch(
  () => route.name,
  async (newRouteName) => {
    if (newRouteName === 'Docs') {
      currentTutorialId.value = null
    }
  }
)

watch(() => route.params.tutorialId, async (newId) => {
  if (newId && typeof newId === 'string' && tutorials.value.some(t => t.id === newId)) {
    currentTutorialId.value = newId
    await loadTutorialContent()
  }
})
</script>
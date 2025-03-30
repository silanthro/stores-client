<template>
  <button
    @click="copy"
    class="px-2 py-1 text-sm text-center bg-white border border-neutral-200 rounded-md hover:bg-neutral-100 transition-colors">
    <span v-if="copySuccess" class="flex flex-row items-center gap-2"
      ><CheckCircleIcon class="w-4 h-4" /> Copied!</span
    >
    <span v-else class="flex flex-row items-center gap-2"
      ><DocumentDuplicateIcon class="w-4 h-4" /> Copy for LLM</span
    >
  </button>
</template>
<script setup lang="ts">
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{ content: string }>()

const copySuccess = ref(false)
const copy = async (): Promise<void> => {
  if (!props.content) return
  try {
    await navigator.clipboard.writeText(props.content.toString())
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

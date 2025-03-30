<template>
  <button @click="copyHelper">
    <DocumentDuplicateIcon
      class="w-6 h-6 transition"
      :class="[copied ? 'text-black' : 'text-neutral-400']" />
  </button>
</template>
<script setup lang="ts">
import { DocumentDuplicateIcon } from '@heroicons/vue/24/outline'
import { ref } from 'vue'

const props = defineProps({
  copy: {
    type: String,
    required: true,
  },
})

const copied = ref(false)
function copyHelper() {
  navigator.clipboard.writeText(props.copy)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 500)
}
</script>

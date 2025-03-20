<!-- CodeBlock.vue -->
<template>
  <div class="not-prose text-sm relative">
    <div class="absolute right-3 top-3">
      <CopyButton :copy="props.code" />
    </div>
    <pre class="rounded"><code :class="`language-${language} block p-4 overflow-x-auto`" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prism-themes/themes/prism-one-light.css'
import CopyButton from '@/components/elements/CopyButton.vue'
import type { CodeBlockProps } from '@/utils/types'

const props = defineProps<CodeBlockProps>()

const highlightedCode = computed(() => {
  return Prism.highlight(
    props.code,
    Prism.languages[props.language] || Prism.languages.plaintext,
    props.language
  )
})
</script>

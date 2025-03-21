<template>
  <div class="markdown-container" v-html="html"></div>
</template>
<script setup lang="ts">
import markdownit from 'markdown-it'
import { computed } from 'vue'

const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
})

const props = defineProps({
  markdown: {
    type: String,
    required: true,
  },
})

const html = computed(() => {
  return md.render(props.markdown)
})
</script>

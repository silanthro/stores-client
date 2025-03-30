<template>
  <div
    class="relative not-prose border border-neutral-200 divide-y-1 divide-neutral-200">
    <div v-if="props.filename" class="px-4 py-2.5 text-sm font-medium">
      {{ props.filename }}
    </div>
    <div class="relative">
      <pre
        class="not-prose py-4 bg-[#FCFCFC] relative overflow-auto"
        :class="props.class"><slot /></pre>
      <ElementsCopyButton class="absolute top-4 right-4" :copy="props.code" />
    </div>
  </div>
</template>
<style>
pre code {
  display: block;
  min-width: 100%;
  width: max-content;
  overflow: hidden;
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
}
pre code .line {
  padding-inline: 1rem;
  display: block;
}
code span.line.highlight {
  width: 100%;
  border-left: 2px solid #ec4899;
  padding-left: calc(1rem - 2px);
  background: #fdf2f8;
}
</style>
<script setup lang="ts">
const props = defineProps({
  code: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
})
</script>

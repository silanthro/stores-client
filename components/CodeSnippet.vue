<template>
  <ContentRenderer v-if="snippet" :value="snippet" />
</template>
<script setup lang="ts">
const { data: snippet } = await useAsyncData(() => {
  return queryCollection('codeSnippet').first()
})
</script>

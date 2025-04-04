<template>
  <div class="flex h-full">
    <DocsSidebar
      heading="Contribute"
      heading-link="/docs/contribute"
      collection-name="contribute"
      collectionTOC="contributeTOC"
      :articles="articles" />
    <div class="grow">
      <NuxtPage />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Article } from '@/utils/types/docs'

const { data: allReferenceArticles } = await useAsyncData(() => {
  return queryCollection('contribute').all()
})

const articleEntries: any[] = []

function mapArticle(articleEntry: any): Article {
  const articleKey = Object.keys(articleEntry)[0]
  const children = (Object.values(articleEntry)[0] as any[]) || []
  if (articleKey.startsWith('/')) {
    const foundArticle = allReferenceArticles.value?.find((a) =>
      a.stem.endsWith(articleKey),
    )
    if (foundArticle)
      return {
        id: foundArticle.stem.split('/').slice(-1)[0],
        label: foundArticle.title,
        title: foundArticle.title,
        link: `/docs/contribute/${foundArticle.stem.split('/').slice(-1)[0]}`,
        children: children.map(mapArticle),
      }
  }
  return {
    id: articleKey,
    label: articleKey,
    title: articleKey,
    link: '',
    children: children.map(mapArticle),
  }
}

const articles = computed(() => {
  if (!allReferenceArticles.value) return []
  return articleEntries.map(mapArticle)
})
</script>

<template>
  <div class="flex h-full">
    <DocsSidebar
      heading="Guide"
      heading-link="/docs/guide"
      collection-name="guide"
      collectionTOC="guideTOC" />
    <div class="grow">
      <NuxtPage />
    </div>
  </div>
</template>

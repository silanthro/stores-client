<template>
  <div class="flex flex-col md:flex-row h-full">
    <DocsSidebar
      heading="Guide"
      heading-link="/docs/guide"
      collection-name="guide"
      collectionTOC="guideTOC" />
    <div class="grow px-4">
      <NuxtPage />
    </div>
  </div>
</template>
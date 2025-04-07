<template>
  <div class="flex flex-col md:flex-row h-full">
    <DocsSidebar
      heading="Contribute"
      heading-link="/docs/contribute"
      collection-name="contribute"
      collectionTOC="contributeTOC" />
    <div class="grow px-4">
      <NuxtPage />
    </div>
  </div>
</template>

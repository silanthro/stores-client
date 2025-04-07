<template>
  <div class="flex flex-col md:flex-row h-full">
    <DocsSidebar
      heading="Cookbook"
      heading-link="/docs/cookbook"
      collection-name="cookbook"
      collectionTOC="cookbookTOC" />
    <div class="grow px-4">
      <NuxtPage />
    </div>
  </div>
</template>

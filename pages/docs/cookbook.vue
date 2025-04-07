<template>
  <div
    class="flex flex-col md:flex-row h-full overflow-auto md:overflow-hidden">
    <DocsSidebar
      heading="Cookbook"
      heading-link="/docs/cookbook"
      collection-name="cookbook"
      collectionTOC="cookbookTOC" />
    <div class="grow overflow-hidden">
      <NuxtPage />
    </div>
  </div>
</template>

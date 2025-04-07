<template>
  <div
    class="flex flex-col md:flex-row h-full overflow-auto md:overflow-hidden">
    <DocsSidebar
      heading="Contribute"
      heading-link="/docs/contribute"
      collection-name="contribute"
      collectionTOC="contributeTOC" />
    <div class="grow shrink overflow-hidden">
      <NuxtPage />
    </div>
  </div>
</template>

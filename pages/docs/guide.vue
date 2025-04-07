<template>
  <div
    class="flex flex-col md:flex-row h-full overflow-auto md:overflow-hidden">
    <DocsSidebar
      heading="Guide"
      heading-link="/docs/guide"
      collection-name="guide"
      collectionTOC="guideTOC" />
    <div class="grow overflow-hidden">
      <NuxtPage />
    </div>
  </div>
</template>

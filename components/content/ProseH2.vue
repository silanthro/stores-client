<template>
  <h2><slot /></h2>
</template>
<style scoped>
h2 {
  font-size: var(--text-2xl); /* 1.5rem (24px) */
  line-height: var(--text-2xl--line-height); /* calc(2 / 1.5) */
  font-weight: 600;
}
</style>

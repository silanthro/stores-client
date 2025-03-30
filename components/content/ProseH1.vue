<template>
  <h1><slot /></h1>
</template>
<style scoped>
h1 {
  font-size: var(--text-3xl); /* 1.875rem (30px) */
  line-height: var(--text-3xl--line-height); /* calc(2.25 / 1.875) */
  font-weight: 600;
}
</style>

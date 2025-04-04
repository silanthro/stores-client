<template>
  <div
    class="z-10 w-full bg-white flex justify-between items-center py-2 border-b border-neutral-200"
    :class="isDocsPage(route.path) ? 'px-4' : 'px-10'">
    <NuxtLink to="/" class="px-2 font-semibold text-xl font-display">
      Stores
    </NuxtLink>
    <div class="flex justify-between items-center" :class="{ 'w-full': isDocsPage(route.path) }">
      <div class="flex items-center">
        <NuxtLink
          :to="page.link"
          v-for="page in navigationPages"
          :class="[
            'px-4 pt-2.5 pb-1.5 hover:underline',
            { 'text-pink-600': isActivePage(page.link) }
          ]">
          {{ page.name }}
        </NuxtLink>
      </div>
      <div class="flex items-center">
        <div v-if="userStore.username" class="relative">
          <Menu>
            <MenuButton class="px-4 pt-2.5 pb-1.5 hover:underline">
              {{ userStore.username }}
            </MenuButton>
            <MenuItems
              class="absolute top-full right-0 bg-white border w-max min-w-36 flex flex-col">
              <MenuItem v-slot="{ active }" class="px-4 pt-2.5 pb-1.5">
                <button
                  class="text-left"
                  :class="{ 'bg-neutral-100': active }"
                  @click="router.push('/add_tools')">
                  Add tools
                </button>
              </MenuItem>
              <MenuItem v-slot="{ active }" class="px-4 pt-2.5 pb-1.5">
                <button
                  class="text-left"
                  :class="[active ? 'bg-neutral-100' : '']"
                  @click="userStore.logout">
                  Log out
                </button>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
        <button v-else class="px-4 pt-2.5 pb-1.5 hover:underline" @click="userStore.login">
          Log in
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const navigationPages = computed(() => isDocsPage(route.path) ? docsPages : mainPages)

const isDocsPage = (link: string) => {
  return link.startsWith('/docs')
}

const isActivePage = (link: string) => {
  if (link === '/docs') {
    return route.path === link
  }
  return route.path.startsWith(link)
}

const mainPages = [
  {
    name: 'About',
    link: '/about',
  },
  {
    name: 'Docs',
    link: '/docs',
  },
  {
    name: 'Contribute',
    link: '/docs/contribute',
  },
  {
    name: 'Blog',
    link: '/blog',
  },
]

const docsPages = [
  {
    name: 'Overview',
    link: '/docs',
  },
  {
    name: 'Guide',
    link: '/docs/guide',
  },
  {
    name: 'Quickstarts',
    link: '/docs/quickstarts',
  },
  {
    name: 'Cookbook',
    link: '/docs/cookbook',
  },
  {
    name: 'Contribute',
    link: '/docs/contribute',
  },
]
</script>

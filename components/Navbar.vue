<template>
  <div
    class="z-20 w-full bg-white flex justify-between items-center py-2 px-4 md:px-10 border-b border-neutral-200">
    <NuxtLink to="/" class="font-semibold text-xl font-display">
      Stores
    </NuxtLink>

    <!-- Mobile menu button -->
    <Menu v-slot="{ open }">
      <MenuButton class="md:hidden p-2" aria-label="Toggle menu">
        <Bars3Icon v-if="!open" class="w-6 h-6" />
        <XMarkIcon v-else class="w-6 h-6" />
      </MenuButton>
      <MenuItems
        class="z-10 md:hidden absolute top-14 left-0 w-full grid grid-cols-2 bg-white border border-neutral-200">
        <MenuItem v-for="page in pages" v-slot="{ active }">
          <NuxtLink
            :to="page.link"
            class="block px-4 py-2 hover:underline"
            :class="[active ? 'bg-neutral-100' : '']">
            {{ page.name }}
          </NuxtLink>
        </MenuItem>
        <span
          v-if="userStore.username"
          class="px-4 py-2 font-medium col-span-2">
          {{ userStore.username }}
        </span>
        <MenuItem
          v-if="userStore.username"
          v-slot="{ active }"
          class="px-4 py-2">
          <button
            class="block text-left"
            :class="{ 'bg-neutral-100': active }"
            @click="router.push('/add_tools')">
            Add tools
          </button>
        </MenuItem>
        <MenuItem
          v-if="userStore.username"
          v-slot="{ active }"
          class="px-4 py-2">
          <button
            class="block text-left"
            :class="[active ? 'bg-neutral-100' : '']"
            @click="userStore.logout">
            Log out
          </button>
        </MenuItem>
        <MenuItem v-else v-slot="{ active }" class="px-4 py-2">
          <button
            class="block text-left"
            :class="[active ? 'bg-neutral-100' : '']"
            @click="userStore.login">
            Log in
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>

    <!-- Desktop navigation -->
    <div class="hidden md:flex md:items-center">
      <NuxtLink
        :to="page.link"
        v-for="page in pages"
        class="px-4 py-2 hover:underline">
        {{ page.name }}
      </NuxtLink>
      <div v-if="userStore.username" class="relative">
        <Menu>
          <MenuButton class="px-4 py-2 hover:underline">
            {{ userStore.username }}
          </MenuButton>
          <MenuItems
            class="absolute top-full right-0 bg-white border w-max min-w-36 flex flex-col">
            <MenuItem v-slot="{ active }" class="px-4 py-2">
              <button
                class="text-left"
                :class="{ 'bg-neutral-100': active }"
                @click="router.push('/add_tools')">
                Add tools
              </button>
            </MenuItem>
            <MenuItem v-slot="{ active }" class="px-4 py-2">
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
      <button v-else class="px-4 py-2 hover:underline" @click="userStore.login">
        Log in
      </button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const userStore = useUserStore()

const pages = [
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
</script>

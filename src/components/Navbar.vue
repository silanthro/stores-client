<template>
  <div class="w-full flex justify-between py-4 px-10">
    <RouterLink to="/" class="px-4 py-2 font-semibold text-2xl font-display">
      Stores
    </RouterLink>
    <div class="flex items-center">
      <RouterLink
        :to="page.link"
        v-for="page in pages"
        class="px-4 py-2 hover:underline">
        {{ page.name }}
      </RouterLink>
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
                @click="router.push('/add_index')">
                Add index
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
import { RouterLink, useRouter } from 'vue-router'
import { useUserStore } from '@/utils/userStore'

const router = useRouter()
const userStore = useUserStore()
const pages = [
  {
    name: 'How to use',
    link: '/',
  },
  {
    name: 'Contribute',
    link: '/',
  },
]
</script>

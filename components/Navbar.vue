<template>
  <div
    class="z-10 w-full bg-white flex justify-between items-center py-2 px-10 border-b border-neutral-200">
    <NuxtLink to="/" class="px-2 font-semibold text-xl font-display">
      Stores
    </NuxtLink>
    <div class="flex items-center">
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

const router = useRouter()
const userStore = useUserStore()
const toolsStore = useToolsStore()
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

onMounted(() => {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) {
      userStore.userId = session.user.id
      userStore.username = session.user.user_metadata.preferred_username
    }
    if (session && session.provider_token) {
      userStore.oauthToken = session.provider_token
    }
    if (session && session.provider_refresh_token) {
      userStore.oauthRefreshToken = session.provider_refresh_token
    }
  })
  toolsStore.refresh()
})
</script>

<template>
  <div class="h-screen w-full flex flex-col text-black">
    <Navbar />
    <div class="grow w-full max-w-[72rem] mx-auto">
      <RouterView />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { supabase } from '@/utils/supabase'
import { useUserStore } from '@/utils/userStore'

const store = useUserStore()

onMounted(() => {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session && session.user) {
      store.userId = session.user.id
      store.username = session.user.user_metadata.preferred_username
    }
    if (session && session.provider_token) {
      store.oauthToken = session.provider_token
    }
    if (session && session.provider_refresh_token) {
      store.oauthRefreshToken = session.provider_refresh_token
    }
  })
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup lang="ts">
import { supabase } from '@/utils/supabase'

const userStore = useUserStore()

supabase.auth.onAuthStateChange((_event, session) => {
  if (session && session.user) {
    userStore.userId = session.user.id
    userStore.username = session.user.user_metadata.preferred_username
  }
  if (session) {
    if (session.provider_token) {
      userStore.oauthToken = session.provider_token
    } else {
      userStore.logout()
    }
  }
})
</script>

<template>
  <Main></Main>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import Main from '@/components/Main.vue'
import { supabase } from '@/utils/supabase'
import { useUserStore } from '@/utils/userStore'

const store = useUserStore()

onMounted(() => {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session && session.provider_token) {
      store.oauthToken = session.provider_token
    }

    if (session && session.provider_refresh_token) {
      store.oauthRefreshToken = session.provider_refresh_token
    }
  })
})
</script>

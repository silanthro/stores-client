import { createRouter, createWebHistory } from 'vue-router'
import AddRepo from '@/components/AddRepo.vue'
import Login from '@/components/Login.vue'
import Main from '@/components/Main.vue'
import Repo from '@/components/Repo.vue'
import ViewIndex from '@/components/ViewIndex.vue'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Main,
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/repo',
    name: 'Repo',
    component: Repo,
  },
  {
    path: '/add_repo',
    name: 'AddRepo',
    component: AddRepo,
  },
  {
    path: '/index/:id+',
    name: 'ViewIndex',
    component: ViewIndex,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

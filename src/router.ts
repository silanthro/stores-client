import { createRouter, createWebHistory } from 'vue-router'
import AddIndex from '@/components/AddIndex.vue'
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
    path: '/repo',
    name: 'Repo',
    component: Repo,
  },
  {
    path: '/add_index',
    name: 'AddIndex',
    component: AddIndex,
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

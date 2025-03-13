import { createRouter, createWebHistory } from 'vue-router'
import AddIndex from '@/pages/AddIndex.vue'
import Main from '@/pages/Main.vue'
import ViewIndex from '@/pages/ViewIndex.vue'

export const routes = [
  {
    path: '/',
    name: 'Home',
    component: Main,
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

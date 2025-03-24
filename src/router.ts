import { createRouter, createWebHistory } from 'vue-router'
import AddIndex from '@/pages/AddIndex.vue'
import Main from '@/pages/Main.vue'
import ViewIndex from '@/pages/ViewIndex.vue'
import Docs from '@/pages/Docs.vue'

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
  {
    path: '/docs',
    name: 'Docs',
    component: Docs,
  },
  {
    path: '/docs/tutorials/:tutorialId',
    name: 'Tutorial',
    component: Docs,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

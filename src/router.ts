import { createRouter, createWebHistory } from 'vue-router'
import Login from './components/Login.vue'
import Main from './components/Main.vue'
import Repo from './components/Repo.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

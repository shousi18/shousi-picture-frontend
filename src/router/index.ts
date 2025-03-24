import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes.ts'

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router

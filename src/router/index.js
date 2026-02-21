import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LoginPage',
      component: () => import('../views/LoginPage.vue'),
    },
    {
      path: '/LayOut',
      name: 'LayOut',
      component: () => import('../views/LayOut.vue'),
    },
  ],
})

export default router

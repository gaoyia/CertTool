import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: import('@renderer/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    // 路由懒加载
    component: () => import('@renderer/views/AboutView.vue')
  },
  {
    path: '/cert',
    name: 'cert',
    component: () => import('@renderer/views/CertView.vue')
  }
]

const router = createRouter({
  // 在 Electron 应用中使用 hash 模式更合适
  history: createWebHashHistory(),
  routes
})

export default router

import { createRouter, createWebHashHistory } from 'vue-router'

let indexPath = localStorage.getItem('index') || '/cert-managerment'
const list = ['/cert-managerment', '/cert', '/hosts']
if (!list.includes(indexPath)) {
  indexPath = '/cert-managerment'
}

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: indexPath
  },
  {
    path: '/cert-managerment',
    name: 'cert-managerment',
    component: () => import('@renderer/views/CertManagermentView.vue')
  },
  {
    path: '/donate',
    name: 'donate',
    component: () => import('@renderer/views/DonateView.vue')
  },
  {
    path: '/cert',
    name: 'cert',
    component: () => import('@renderer/views/CertView.vue')
  },
  {
    path: '/hosts',
    name: 'hosts',
    component: () => import('@renderer/views/HostsView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: indexPath
  }
]

const router = createRouter({
  // 在 Electron 应用中使用 hash 模式更合适
  history: createWebHashHistory(),
  routes
})

export default router

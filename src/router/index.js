import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/pages/layout/Layout'

Vue.use(Router)

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/redis',
    children: [
      {
        path: 'redis',
        component: () => import('@/pages/redis/Redis')
      }
    ]
  },
  {
    path: '/setting',
    component: Layout,
    children: [
      {
        path: '',
        component: () => import('@/pages/setting/Setting')
      }
    ]
  }
]

export default new Router({
  routes: routes
})

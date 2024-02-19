import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'shippingorder',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/1_shippingOrder.vue')
  },
  {
    path: '/palletscan',
    name: 'palletscan',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/2_palletScan.vue')
  },
  {
    path: '/scandetail',
    name: 'scandetail',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/3_scanDetail.vue')
  },
  {
    path: '/productscan',
    name: 'productscan',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/4_productScan.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/1_mainView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/scanning',
    name: 'about',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/2_scanView.vue')
  },
  {
    path: '/scandetail',
    name: 'scandetail',
    component: () =>
      import(/* webpackChunkName: "about" */ '../views/3_scanDetail.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router

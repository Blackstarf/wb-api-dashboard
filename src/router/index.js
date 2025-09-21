import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/sales'
  },
  {
    path: '/sales',
    name: 'sales',
    component: () => import('../pages/SalesPage.vue') // ../ вместо @
  },
  {
    path: '/orders', 
    name: 'orders',
    component: () => import('../pages/OrdersPage.vue')
  },
  {
    path: '/incomes',
    name: 'incomes',
    component: () => import('../pages/IncomesPage.vue')
  },
  {
    path: '/stocks',
    name: 'stocks',
    component: () => import('../pages/StocksPage.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
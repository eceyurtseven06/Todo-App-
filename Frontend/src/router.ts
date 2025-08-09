import { createWebHistory, createRouter , type RouteRecordRaw } from 'vue-router'

import LoginView from './views/LoginView.vue'
import RegisterView from './views/RegisterView.vue'
import TodoView from './views/TodoView.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: TodoView },
  { path: '/login', component: LoginView },
  { path: '/register', component: RegisterView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)
  const loggedIn = localStorage.getItem('token')

  if (authRequired && !loggedIn) {
    return next('/login')
  }
  next()
})

export default router



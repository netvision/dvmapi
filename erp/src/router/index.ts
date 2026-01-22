import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('../layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/Dashboard.vue')
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('../views/Users.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'news',
          name: 'News',
          component: () => import('../views/NewsNew.vue')
        },
        {
          path: 'events',
          name: 'Events',
          component: () => import('../views/EventsNew.vue')
        },
        {
          path: 'achievers',
          name: 'Achievers',
          component: () => import('../views/Achievers.vue')
        },
        {
          path: 'students',
          name: 'Students',
          component: () => import('../views/Students.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'staff',
          name: 'Staff',
          component: () => import('../views/Staff.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'classes',
          name: 'Classes',
          component: () => import('../views/Classes.vue'),
          meta: { requiresAdmin: true }
        },
        {
          path: 'contact-messages',
          name: 'ContactMessages',
          component: () => import('../views/ContactMessages.vue'),
          meta: { requiresAdmin: true }
        }
      ]
    }
  ]
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  authStore.initializeFromStorage()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-primary-800 text-white shadow-lg">
      <div class="p-6 border-b border-primary-700">
        <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img 
            src="/images/dvm-logo-white.png" 
            alt="Dalmia Vidya Mandir Logo" 
            class="w-12 h-12 object-contain"
          />
          <div>
            <h1 class="text-lg font-bold leading-tight">Dalmia Vidya Mandir</h1>
            <p class="text-xs text-blue-200 font-medium">ERP Dashboard</p>
          </div>
        </router-link>
      </div>
      
      <nav class="mt-6">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center px-6 py-3 hover:bg-primary-700 transition-colors"
          :class="{ 'bg-primary-700': $route.path === item.path }"
        >
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="ml-64">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="flex items-center justify-between px-8 py-4">
          <h2 class="text-2xl font-semibold text-gray-800">{{ pageTitle }}</h2>
          
          <div class="flex items-center gap-4">
            <span class="text-gray-600">{{ authStore.user?.first_name }} {{ authStore.user?.last_name }}</span>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuItems = computed(() => {
  const items = [{ path: '/', label: 'Dashboard' }]
  
  if (authStore.isAdmin) {
    items.push({ path: '/news', label: 'News Management' })
    items.push({ path: '/events', label: 'Events Management' })
    items.push({ path: '/achievers', label: 'Achievers Management' })
    items.push({ path: '/students', label: 'Student Management' })
    items.push({ path: '/attendance', label: 'Attendance' })
    items.push({ path: '/exam-results', label: 'Exam Results' })
    items.push({ path: '/staff', label: 'Staff Management' })
    items.push({ path: '/classes', label: 'Classes & Sections' })
    items.push({ path: '/contact-messages', label: 'Contact Messages' })
    items.push({ path: '/users', label: 'User Management' })
  } else if (authStore.user?.role === 'teacher') {
    items.push({ path: '/attendance', label: 'Attendance' })
    items.push({ path: '/exam-results', label: 'Exam Results' })
  } else if (authStore.user?.role === 'student') {
    items.push({ path: '/exam-results', label: 'Exam Results' })
  }
  
  return items
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/users': 'User Management',
    '/news': 'News Management',
    '/events': 'Events Management',
    '/achievers': 'Achievers Management',
    '/students': 'Student Management',
    '/attendance': 'Attendance',
    '/exam-results': 'Exam Results',
    '/staff': 'Staff Management',
    '/classes': 'Classes & Sections',
    '/contact-messages': 'Contact Messages'
  }
  return titles[route.path] || 'ERP Admin'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

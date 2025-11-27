<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-primary-800 text-white shadow-lg">
      <div class="p-6">
        <h1 class="text-2xl font-bold">Institute ERP</h1>
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
  const items = [
    { path: '/', label: 'Dashboard' },
    { path: '/news', label: 'News Management' },
    { path: '/events', label: 'Events Management' },
  ]
  
  if (authStore.isAdmin) {
    items.push({ path: '/users', label: 'User Management' })
  }
  
  return items
})

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/users': 'User Management',
    '/news': 'News Management',
    '/events': 'Events Management'
  }
  return titles[route.path] || 'ERP Admin'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

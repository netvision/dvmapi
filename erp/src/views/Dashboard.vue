<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Total Users</h3>
        <p class="text-3xl font-bold text-primary-600 mt-2">{{ stats.totalUsers }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Published News</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ stats.publishedNews }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Upcoming Events</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ stats.upcomingEvents }}</p>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Active Students</h3>
        <p class="text-3xl font-bold text-purple-600 mt-2">{{ stats.activeStudents }}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Welcome to Institute ERP</h2>
      <p class="text-gray-600">
        Manage your institute's operations efficiently with this comprehensive ERP system.
        Use the navigation menu to access different modules.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import userService from '../services/user.service'
import cmsService from '../services/cms.service'

const stats = ref({
  totalUsers: 0,
  publishedNews: 0,
  upcomingEvents: 0,
  activeStudents: 0
})

onMounted(async () => {
  try {
    const [users, news, events] = await Promise.all([
      userService.getUsers({ limit: 1 }),
      cmsService.getNews({ status: 'published', limit: 1 }),
      cmsService.getEvents({ upcoming: true, limit: 1 })
    ])
    
    stats.value.totalUsers = users.pagination.total
    stats.value.publishedNews = news.pagination.total
    stats.value.upcomingEvents = events.pagination.total
    stats.value.activeStudents = 0 // Placeholder
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  }
})
</script>

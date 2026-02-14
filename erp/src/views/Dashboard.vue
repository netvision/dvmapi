<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" v-if="dashboardRole === 'admin'">
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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" v-else-if="dashboardRole === 'student'">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Class</h3>
        <p class="text-3xl font-bold text-primary-600 mt-2">{{ studentDashboard.classLabel }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Present Days</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ studentDashboard.presentDays }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Exams Attempted</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ studentDashboard.examsAttempted }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Average %</h3>
        <p class="text-3xl font-bold text-purple-600 mt-2">{{ studentDashboard.averagePercentage }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" v-else>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Designation</h3>
        <p class="text-3xl font-bold text-primary-600 mt-2">{{ staffDashboard.designation }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Assigned Subjects</h3>
        <p class="text-3xl font-bold text-green-600 mt-2">{{ staffDashboard.assignedSubjects }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Assigned Classes</h3>
        <p class="text-3xl font-bold text-blue-600 mt-2">{{ staffDashboard.assignedClasses }}</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-gray-500 text-sm font-medium">Pending Leaves</h3>
        <p class="text-3xl font-bold text-purple-600 mt-2">{{ staffDashboard.pendingLeaves }}</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Welcome to Institute ERP</h2>
      <p class="text-gray-600">
        {{ welcomeText }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import userService from '../services/user.service'
import cmsService from '../services/cms.service'
import studentService from '../services/student.service'
import { staffService } from '../services/staff.service'

const authStore = useAuthStore()

const dashboardRole = computed(() => {
  if (authStore.user?.role === 'student') return 'student'
  if (authStore.user?.role === 'admin') return 'admin'
  return 'staff'
})

const stats = ref({
  totalUsers: 0,
  publishedNews: 0,
  upcomingEvents: 0,
  activeStudents: 0
})

const studentDashboard = ref({
  classLabel: '-',
  presentDays: 0,
  examsAttempted: 0,
  averagePercentage: 0
})

const staffDashboard = ref({
  designation: '-',
  assignedSubjects: 0,
  assignedClasses: 0,
  pendingLeaves: 0
})

const welcomeText = computed(() => {
  if (dashboardRole.value === 'student') {
    return 'Track your class progress, attendance, and exam performance from your student dashboard.'
  }
  if (dashboardRole.value === 'staff') {
    return 'Manage your teaching assignments, pending tasks, and institutional responsibilities from your staff dashboard.'
  }
  return "Manage your institute's operations efficiently with this comprehensive ERP system. Use the navigation menu to access different modules."
})

onMounted(async () => {
  try {
    if (dashboardRole.value === 'student') {
      const response = await studentService.getMyDashboard()
      const data = response.data
      studentDashboard.value.classLabel = `${data.profile.class}${data.profile.section ? `-${data.profile.section}` : ''}`
      studentDashboard.value.presentDays = Number(data.attendance.present_days || 0)
      studentDashboard.value.examsAttempted = Number(data.results.exams_attempted || 0)
      studentDashboard.value.averagePercentage = Number(data.results.average_percentage || 0)
      return
    }

    if (dashboardRole.value === 'staff') {
      const response = await staffService.getMyDashboard()
      const data = response.data
      staffDashboard.value.designation = data.profile.designation || 'Staff'
      staffDashboard.value.assignedSubjects = Number(data.assignments.assigned_subjects || 0)
      staffDashboard.value.assignedClasses = Number(data.assignments.assigned_classes || 0)
      staffDashboard.value.pendingLeaves = Number(data.leaves.pending_leaves || 0)
      return
    }

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

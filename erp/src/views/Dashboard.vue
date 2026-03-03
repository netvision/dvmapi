<template>
  <div class="space-y-6 max-w-6xl">

    <!-- ── Greeting ── -->
    <div>
      <h1 class="text-xl font-semibold text-slate-900">Good {{ timeOfDay }}, {{ firstName }} 👋</h1>
      <p class="text-slate-500 text-sm mt-1">{{ welcomeText }}</p>
    </div>

    <!-- ── Admin stat cards ── -->
    <div v-if="dashboardRole === 'admin'" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        v-for="card in adminCards"
        :key="card.label"
        :label="card.label"
        :value="card.value"
        :icon="card.icon"
        :color="card.color"
      />
    </div>

    <!-- ── Student stat cards ── -->
    <div v-else-if="dashboardRole === 'student'" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="My Class"         :value="studentDashboard.classLabel"        :icon="School"        color="blue" />
      <StatCard label="Present Days"     :value="studentDashboard.presentDays"       :icon="CalendarCheck" color="green" />
      <StatCard label="Exams Attempted"  :value="studentDashboard.examsAttempted"    :icon="FileText"      color="purple" />
      <StatCard label="Average %"        :value="studentDashboard.averagePercentage + '%'" :icon="TrendingUp" color="orange" />
    </div>

    <!-- ── Staff/Teacher stat cards ── -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Designation"      :value="staffDashboard.designation"     :icon="Briefcase"    color="blue" />
      <StatCard label="Subjects"         :value="staffDashboard.assignedSubjects" :icon="BookOpen"    color="green" />
      <StatCard label="Classes"          :value="staffDashboard.assignedClasses"  :icon="School"      color="purple" />
      <StatCard label="Pending Leaves"   :value="staffDashboard.pendingLeaves"   :icon="CalendarDays" color="orange" />
    </div>

    <!-- ── Admin quick-navigate grid ── -->
    <div v-if="dashboardRole === 'admin'">
      <h2 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Access</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <QuickLink v-for="link in quickLinks" :key="link.to" :to="link.to" :label="link.label" :icon="link.icon" :color="link.color" />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, defineComponent, h } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import userService from '../services/user.service'
import cmsService from '../services/cms.service'
import studentService from '../services/student.service'
import { staffService } from '../services/staff.service'
import {
  Users, GraduationCap, Newspaper, CalendarDays, School, CalendarCheck,
  FileText, TrendingUp, Briefcase, BookOpen, Trophy,
  UserCog, FileBarChart2
} from 'lucide-vue-next'

const authStore = useAuthStore()

// ── Subcomponents ───────────────────────────────────────────────────────
const colorMap: Record<string, { bg: string; text: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600' },
  green:  { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-600' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600' },
}

const StatCard = defineComponent({
  props: {
    label: { type: String, required: true },
    value: { type: [String, Number], required: true },
    icon: { type: [Object, Function], required: true },
    color: { type: String, default: 'blue' }
  },
  setup(props) {
    return () => {
      const c = colorMap[props.color] || colorMap.blue
      return h('div', { class: 'bg-white border border-slate-200 rounded-xl p-5' }, [
        h('div', { class: 'flex items-center gap-3 mb-3' }, [
          h('div', { class: `w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}` }, [
            h(props.icon, { size: 16, class: c.text })
          ]),
          h('span', { class: 'text-sm text-slate-500 font-medium' }, props.label)
        ]),
        h('p', { class: 'text-2xl font-bold text-slate-900 tracking-tight' }, String(props.value))
      ])
    }
  }
})

const QuickLink = defineComponent({
  props: {
    to: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: [Object, Function], required: true },
    color: { type: String, default: 'blue' }
  },
  setup(props) {
    return () => {
      const c = colorMap[props.color] || colorMap.blue
      return h(RouterLink, {
        to: props.to,
        class: 'flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all group'
      }, () => [
        h('div', { class: `w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.bg}` }, [
          h(props.icon, { size: 15, class: c.text })
        ]),
        h('span', { class: 'text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors' }, props.label)
      ])
    }
  }
})

// ── Data ───────────────────────────────────────────────────────────────
const dashboardRole = computed(() => {
  if (authStore.user?.role === 'student') return 'student'
  if (authStore.user?.role === 'admin') return 'admin'
  return 'staff'
})

const firstName = computed(() => authStore.user?.first_name || 'there')

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const stats = ref({ totalUsers: 0, publishedNews: 0, upcomingEvents: 0, activeStudents: 0 })

const adminCards = computed(() => [
  { label: 'Total Users',      value: stats.value.totalUsers,      icon: Users,        color: 'blue' },
  { label: 'Active Students',  value: stats.value.activeStudents,  icon: GraduationCap, color: 'purple' },
  { label: 'Published News',   value: stats.value.publishedNews,   icon: Newspaper,    color: 'green' },
  { label: 'Upcoming Events',  value: stats.value.upcomingEvents,  icon: CalendarDays, color: 'orange' },
])

const quickLinks = [
  { to: '/students',        label: 'Students',        icon: GraduationCap, color: 'purple' },
  { to: '/staff',           label: 'Staff',           icon: Briefcase,     color: 'blue' },
  { to: '/attendance',      label: 'Attendance',      icon: CalendarCheck, color: 'green' },
  { to: '/exam-results',    label: 'Exam Results',    icon: FileBarChart2, color: 'orange' },
  { to: '/learning',        label: 'Lesson Plans',    icon: BookOpen,      color: 'teal' },
  { to: '/news',            label: 'News',            icon: Newspaper,     color: 'blue' },
  { to: '/achievers',       label: 'Achievers',       icon: Trophy,        color: 'orange' },
  { to: '/users',           label: 'User Management', icon: UserCog,       color: 'pink' },
]

const studentDashboard = ref({ classLabel: '-', presentDays: 0, examsAttempted: 0, averagePercentage: 0 })
const staffDashboard   = ref({ designation: '-', assignedSubjects: 0, assignedClasses: 0, pendingLeaves: 0 })

const welcomeText = computed(() => {
  if (dashboardRole.value === 'student') return 'Track your class progress, attendance and exam performance.'
  if (dashboardRole.value === 'staff')   return 'Manage your teaching assignments and institutional responsibilities.'
  return "Here's an overview of your institute's current activity."
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

    const [users, news, events, studentStats] = await Promise.all([
      userService.getUsers({ limit: 1 }),
      cmsService.getNews({ status: 'published', limit: 1 }),
      cmsService.getEvents({ upcoming: true, limit: 1 }),
      studentService.getStatistics()
    ])

    stats.value.totalUsers     = users.pagination.total
    stats.value.publishedNews  = news.pagination.total
    stats.value.upcomingEvents = events.pagination.total
    stats.value.activeStudents = Number(studentStats.data.overview.active_students || 0)
  } catch (error) {
    console.error('Failed to load dashboard stats:', error)
  }
})
</script>

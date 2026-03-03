<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden">

    <!-- ───── Sidebar ───── -->
    <aside class="flex flex-col w-60 flex-shrink-0 bg-[#0f172a] h-full">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <router-link to="/" class="flex items-center gap-3 w-full">
          <div class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img src="/images/dvm-logo-white.png" alt="logo" class="w-full h-full object-cover" />
          </div>
          <div class="overflow-hidden">
            <p class="text-white text-sm font-semibold leading-tight truncate">Dalmia Vidya Mandir</p>
            <p class="text-slate-400 text-xs mt-0.5">ERP System</p>
          </div>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto sidebar-nav py-4 px-2 space-y-5">

        <!-- Overview -->
        <div>
          <p class="section-title text-[10px]">Overview</p>
          <NavItem to="/" :icon="LayoutDashboard" label="Dashboard" :active="$route.path === '/'" />
        </div>

        <!-- Academic (always visible for teacher/admin) -->
        <div v-if="showAcademic">
          <p class="section-title text-[10px]">Academic</p>
          <NavItem v-if="showClasses" to="/classes"       :icon="School"           label="Classes & Sections" :active="$route.path === '/classes'" />
          <NavItem v-if="showLearning" to="/learning"      :icon="BookOpen"         label="Lesson Plans"       :active="$route.path === '/learning'" />
          <NavItem v-if="showAttendance" to="/attendance"  :icon="CalendarCheck"   label="Attendance"         :active="$route.path === '/attendance'" />
          <NavItem v-if="showExams" to="/exam-results"     :icon="FileBarChart2"   label="Exam Results"       :active="$route.path === '/exam-results'" />
        </div>

        <!-- People -->
        <div v-if="authStore.isAdmin">
          <p class="section-title text-[10px]">People</p>
          <NavItem to="/students" :icon="GraduationCap"  label="Students"        :active="$route.path === '/students'" />
          <NavItem to="/staff"    :icon="Briefcase"      label="Staff"           :active="$route.path === '/staff'" />
          <NavItem to="/users"    :icon="UserCog"        label="Users"           :active="$route.path === '/users'" />
        </div>

        <!-- Communication -->
        <div v-if="authStore.isAdmin">
          <p class="section-title text-[10px]">Communication</p>
          <NavItem to="/news"             :icon="Newspaper"      label="News"              :active="$route.path === '/news'" />
          <NavItem to="/events"           :icon="CalendarDays"   label="Events"            :active="$route.path === '/events'" />
          <NavItem to="/achievers"        :icon="Trophy"         label="Achievers"         :active="$route.path === '/achievers'" />
          <NavItem to="/contact-messages" :icon="MessageSquare"  label="Contact Messages"  :active="$route.path === '/contact-messages'" />
        </div>

      </nav>

      <!-- User footer -->
      <div class="border-t border-slate-800 px-3 py-3 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          {{ userInitials }}
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="text-slate-200 text-sm font-medium truncate">{{ fullName }}</p>
          <p class="text-slate-500 text-xs capitalize truncate">{{ authStore.user?.role }}</p>
        </div>
        <button @click="handleLogout" title="Logout" class="text-slate-500 hover:text-red-400 transition-colors p-1 rounded">
          <LogOut :size="15" />
        </button>
      </div>

    </aside>

    <!-- ───── Main ───── -->
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">

      <!-- Top bar -->
      <header class="flex-shrink-0 bg-white border-b border-slate-200 px-7 py-0 flex items-center justify-between h-14">
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <span class="text-slate-900 font-medium">{{ pageTitle }}</span>
        </div>
        <div class="flex items-center gap-3 text-sm text-slate-500">
          <span>{{ fullName }}</span>
          <span class="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium capitalize">{{ authStore.user?.role }}</span>
        </div>
      </header>

      <!-- Scrollable page content -->
      <main class="flex-1 overflow-y-auto p-7">
        <router-view />
      </main>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  LayoutDashboard, BookOpen, School, CalendarCheck, FileBarChart2,
  GraduationCap, Briefcase, UserCog, Newspaper, CalendarDays,
  Trophy, MessageSquare, LogOut
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// ── Nav item helper component ──────────────────────────────────────────
const NavItem = defineComponent({
  props: {
    to: { type: String, required: true },
    label: { type: String, required: true },
    icon: { type: [Object, Function], required: true },
    active: { type: Boolean, default: false }
  },
  setup(props) {
    return () => h(
      RouterLink,
      {
        to: props.to,
        class: [
          'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
          props.active
            ? 'bg-slate-800 text-white font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
        ]
      },
      () => [
        h(props.icon, { size: 15, class: props.active ? 'text-blue-400' : '' }),
        h('span', props.label)
      ]
    )
  }
})

// ── Computed ───────────────────────────────────────────────────────────
const fullName = computed(() =>
  [authStore.user?.first_name, authStore.user?.last_name].filter(Boolean).join(' ') || 'User')

const userInitials = computed(() => {
  const f = authStore.user?.first_name?.[0] ?? ''
  const l = authStore.user?.last_name?.[0] ?? ''
  return (f + l).toUpperCase() || 'U'
})

const isTeacher = computed(() => authStore.user?.role === 'teacher')

const showAcademic   = computed(() => authStore.isAdmin || isTeacher.value || authStore.user?.role === 'user')
const showClasses    = computed(() => authStore.isAdmin)
const showLearning   = computed(() => authStore.isAdmin || isTeacher.value || authStore.user?.role === 'user')
const showAttendance = computed(() => authStore.isAdmin || isTeacher.value)
const showExams      = computed(() => authStore.isAdmin || isTeacher.value || authStore.user?.role === 'student')

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/users': 'User Management',
    '/news': 'News',
    '/events': 'Events',
    '/achievers': 'Achievers',
    '/students': 'Students',
    '/attendance': 'Attendance',
    '/exam-results': 'Exam Results',
    '/staff': 'Staff',
    '/classes': 'Classes & Sections',
    '/learning': 'Lesson Plans',
    '/contact-messages': 'Contact Messages'
  }
  return titles[route.path] || 'ERP'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

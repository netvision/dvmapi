<template>
  <div class="space-y-5">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Students</h1>
        <p class="page-subtitle" v-if="statistics">{{ statistics.overview.active_students }} active students</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <Plus :size="15" />
        Add Student
      </button>
    </div>

    <!-- Stat cards -->
    <div v-if="statistics" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Active</p>
        <p class="text-2xl font-bold text-blue-600 mt-1.5">{{ statistics.overview.active_students }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Male</p>
        <p class="text-2xl font-bold text-slate-900 mt-1.5">{{ statistics.overview.male_students }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Female</p>
        <p class="text-2xl font-bold text-pink-600 mt-1.5">{{ statistics.overview.female_students }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Classes</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1.5">{{ statistics.overview.total_classes }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-48">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name or admission number…"
            class="form-input pl-8"
            @input="debouncedSearch"
          />
        </div>
        <select v-model="filters.class" class="form-input w-36" @change="loadStudents">
          <option value="">All Classes</option>
          <option v-for="c in 12" :key="c" :value="String(c)">Class {{ c }}</option>
        </select>
        <select v-model="filters.status" class="form-input w-36" @change="loadStudents">
          <option value="active">Active</option>
          <option value="">All Status</option>
          <option value="inactive">Inactive</option>
          <option value="alumni">Alumni</option>
          <option value="transferred">Transferred</option>
        </select>
        <select v-model="filters.academic_year" class="form-input w-36" @change="loadStudents">
          <option value="">All Years</option>
          <option value="2025-2026">2025-2026</option>
          <option value="2024-2025">2024-2025</option>
          <option value="2023-2024">2023-2024</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">

      <!-- Loading -->
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        <p class="mt-3 text-sm text-slate-500">Loading students…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="p-12 text-center">
        <p class="text-red-500 text-sm">{{ error }}</p>
        <button @click="loadStudents" class="btn-secondary mt-4">Retry</button>
      </div>

      <!-- Data -->
      <div v-else-if="students.length > 0">
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Admission No.</th>
                <th>Class</th>
                <th>Parent / Guardian</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in students" :key="student.id">
                <td>
                  <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      {{ student.first_name[0] }}{{ student.last_name[0] }}
                    </div>
                    <div>
                      <p class="font-medium text-slate-900">{{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}</p>
                      <p class="text-xs text-slate-400">{{ student.email || 'No email' }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="text-slate-700">{{ student.admission_number }}</p>
                  <p class="text-xs text-slate-400">Roll: {{ student.roll_number || 'N/A' }}</p>
                </td>
                <td>
                  <p class="text-slate-700">Class {{ student.class }}{{ student.section }}</p>
                  <p class="text-xs text-slate-400">{{ student.academic_year }}</p>
                </td>
                <td>
                  <p class="text-slate-700">{{ student.parent1_name }}</p>
                  <p class="text-xs text-slate-400">{{ student.parent1_phone }}</p>
                </td>
                <td>
                  <span class="badge" :class="{
                    'bg-emerald-50 text-emerald-700': student.status === 'active',
                    'bg-slate-100 text-slate-500': student.status === 'inactive',
                    'bg-blue-50 text-blue-700': student.status === 'alumni',
                    'bg-amber-50 text-amber-700': student.status === 'transferred'
                  }">{{ student.status }}</span>
                </td>
                <td>
                  <div class="flex items-center gap-1">
                    <button @click="viewStudent(student)" class="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="View">
                      <Eye :size="14" />
                    </button>
                    <button @click="editStudent(student)" class="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Edit">
                      <Pencil :size="14" />
                    </button>
                    <button @click="deleteStudent(student)" class="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 :size="14" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
          <p class="text-xs text-slate-500">
            {{ (currentPage - 1) * (filters.limit ?? 50) + 1 }}–{{ Math.min(currentPage * (filters.limit ?? 50), totalStudents) }} of {{ totalStudents }}
          </p>
          <div class="flex items-center gap-2">
            <button @click="previousPage" :disabled="currentPage === 1" class="btn-secondary py-1.5 px-3 disabled:opacity-40">
              <ChevronLeft :size="14" />
            </button>
            <span class="text-xs text-slate-500">{{ currentPage }} / {{ totalPages }}</span>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-secondary py-1.5 px-3 disabled:opacity-40">
              <ChevronRight :size="14" />
            </button>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="p-12 text-center">
        <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <GraduationCap :size="22" class="text-slate-400" />
        </div>
        <h3 class="text-sm font-medium text-slate-700 mb-1">No students found</h3>
        <p class="text-xs text-slate-400 mb-4">Get started by adding a new student.</p>
        <button @click="openCreateModal" class="btn-primary">
          <Plus :size="15" /> Add Student
        </button>
      </div>

    </div>

    <!-- Modals -->
    <StudentModal v-if="showModal" :student="selectedStudent" :mode="modalMode" @close="closeModal" @saved="handleStudentSaved" />
    <StudentDetailModal v-if="showDetailModal" :student="selectedStudent" @close="closeDetailModal" @edit="editStudent" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import studentService, { type Student, type StudentFilters, type StudentStatistics } from '../services/student.service'
import StudentModal from '../components/StudentModal.vue'
import StudentDetailModal from '../components/StudentDetailModal.vue'
import { Plus, Search, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-vue-next'

const students = ref<Student[]>([])
const statistics = ref<StudentStatistics | null>(null)
const loading = ref(false)
const error = ref('')
const showModal = ref(false)
const showDetailModal = ref(false)
const selectedStudent = ref<Student | null>(null)
const modalMode = ref<'create' | 'edit'>('create')

const filters = ref<StudentFilters>({
  page: 1,
  limit: 50,
  status: 'active',
  class: '',
  section: '',
  academic_year: '',
  search: ''
})

const currentPage = ref(1)
const totalPages = ref(1)
const totalStudents = ref(0)

let searchTimeout: ReturnType<typeof setTimeout> | undefined

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    loadStudents()
  }, 300)
}

async function loadStudents() {
  loading.value = true
  error.value = ''
  
  try {
    const response = await studentService.getAll(filters.value)
    students.value = response.data.students
    totalStudents.value = response.data.pagination.totalStudents
    currentPage.value = response.data.pagination.currentPage
    totalPages.value = response.data.pagination.totalPages
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load students'
  } finally {
    loading.value = false
  }
}

async function loadStatistics() {
  try {
    const response = await studentService.getStatistics(filters.value.academic_year)
    statistics.value = response.data
  } catch (err) {
    console.error('Failed to load statistics:', err)
  }
}

function openCreateModal() {
  selectedStudent.value = null
  modalMode.value = 'create'
  showModal.value = true
}

function editStudent(student: Student) {
  console.log('Edit student clicked:', student)
  selectedStudent.value = student
  modalMode.value = 'edit'
  showModal.value = true
}

function viewStudent(student: Student) {
  selectedStudent.value = student
  showDetailModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedStudent.value = null
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedStudent.value = null
}

async function handleStudentSaved() {
  closeModal()
  await loadStudents()
  await loadStatistics()
}

async function deleteStudent(student: Student) {
  if (confirm(`Are you sure you want to deactivate ${student.first_name} ${student.last_name}?`)) {
    try {
      await studentService.delete(student.id)
      await loadStudents()
      await loadStatistics()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete student')
    }
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    filters.value.page = currentPage.value - 1
    loadStudents()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    filters.value.page = currentPage.value + 1
    loadStudents()
  }
}

onMounted(() => {
  loadStudents()
  loadStatistics()
})
</script>

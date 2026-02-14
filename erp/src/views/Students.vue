<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Student Management</h1>
      <p class="mt-1 text-sm text-gray-600">Manage student admissions, profiles, and records</p>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Students</p>
            <p class="text-2xl font-bold text-primary-600">{{ statistics.overview.active_students }}</p>
          </div>
          <div class="bg-primary-100 rounded-full p-3">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Male Students</p>
            <p class="text-2xl font-bold text-blue-600">{{ statistics.overview.male_students }}</p>
          </div>
          <div class="bg-blue-100 rounded-full p-3">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Female Students</p>
            <p class="text-2xl font-bold text-pink-600">{{ statistics.overview.female_students }}</p>
          </div>
          <div class="bg-pink-100 rounded-full p-3">
            <svg class="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Classes</p>
            <p class="text-2xl font-bold text-green-600">{{ statistics.overview.total_classes }}</p>
          </div>
          <div class="bg-green-100 rounded-full p-3">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
        <!-- Search -->
        <div class="md:col-span-2">
          <input
            v-model="filters.search"
            type="text"
            placeholder="Search by name or admission number..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @input="debouncedSearch"
          />
        </div>

        <!-- Class Filter -->
        <div>
          <select
            v-model="filters.class"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @change="loadStudents"
          >
            <option value="">All Classes</option>
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            <option value="4">Class 4</option>
            <option value="5">Class 5</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
            <option value="9">Class 9</option>
            <option value="10">Class 10</option>
            <option value="11">Class 11</option>
            <option value="12">Class 12</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div>
          <select
            v-model="filters.status"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @change="loadStudents"
          >
            <option value="active">Active</option>
            <option value="">All Status</option>
            <option value="inactive">Inactive</option>
            <option value="alumni">Alumni</option>
            <option value="transferred">Transferred</option>
          </select>
        </div>

        <!-- Academic Year Filter -->
        <div>
          <select
            v-model="filters.academic_year"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            @change="loadStudents"
          >
            <option value="">All Years</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2023-2024">2023-2024</option>
          </select>
        </div>

        <!-- Add Student Button -->
        <div>
          <button
            @click="openCreateModal"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        </div>
      </div>
    </div>

    <!-- Students Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Loading students...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center">
        <p class="text-red-600">{{ error }}</p>
        <button @click="loadStudents" class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          Retry
        </button>
      </div>

      <!-- Students List -->
      <div v-else-if="students.length > 0">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No.</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parent/Guardian</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="student in students" :key="student.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-primary-600 font-medium text-sm">
                          {{ student.first_name[0] }}{{ student.last_name[0] }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}
                      </div>
                      <div class="text-sm text-gray-500">{{ student.email || 'No email' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ student.admission_number }}</div>
                  <div class="text-sm text-gray-500">Roll: {{ student.roll_number || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">Class {{ student.class }}{{ student.section }}</div>
                  <div class="text-sm text-gray-500">{{ student.academic_year }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ student.parent1_name }}</div>
                  <div class="text-sm text-gray-500">{{ student.parent1_phone }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': student.status === 'active',
                      'bg-gray-100 text-gray-800': student.status === 'inactive',
                      'bg-blue-100 text-blue-800': student.status === 'alumni',
                      'bg-yellow-100 text-yellow-800': student.status === 'transferred'
                    }"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ student.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button @click="viewStudent(student)" class="text-primary-600 hover:text-primary-900 mr-3">View</button>
                  <button @click="editStudent(student)" class="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                  <button @click="deleteStudent(student)" class="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ (currentPage - 1) * filters.limit! + 1 }}</span> to 
                <span class="font-medium">{{ Math.min(currentPage * filters.limit!, totalStudents) }}</span> of 
                <span class="font-medium">{{ totalStudents }}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="previousPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="{
                    'z-10 bg-primary-50 border-primary-500 text-primary-600': page === currentPage,
                    'bg-white border-gray-300 text-gray-500 hover:bg-gray-50': page !== currentPage
                  }"
                  class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                >
                  {{ page }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No students found</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by adding a new student.</p>
        <div class="mt-6">
          <button @click="openCreateModal" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
            <svg class="mr-2 -ml-1 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Student
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <StudentModal
      v-if="showModal"
      :student="selectedStudent"
      :mode="modalMode"
      @close="closeModal"
      @saved="handleStudentSaved"
    />

    <StudentDetailModal
      v-if="showDetailModal"
      :student="selectedStudent"
      @close="closeDetailModal"
      @edit="editStudent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import studentService, { type Student, type StudentFilters, type StudentStatistics } from '../services/student.service'
import StudentModal from '../components/StudentModal.vue'
import StudentDetailModal from '../components/StudentDetailModal.vue'

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

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

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

function goToPage(page: number) {
  filters.value.page = page
  loadStudents()
}

onMounted(() => {
  loadStudents()
  loadStatistics()
})
</script>

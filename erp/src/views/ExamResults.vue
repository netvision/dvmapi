<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Exam Results</h2>

      <div v-if="canManage" class="border border-gray-200 rounded-lg p-4 mb-6">
        <h3 class="text-lg font-medium text-gray-800 mb-4">Add / Update Result</h3>
        <form @submit.prevent="saveResult" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input v-model="resultForm.student_id" type="text" placeholder="Student ID" class="px-3 py-2 border border-gray-300 rounded-lg" required />
          <input v-model="resultForm.examination_id" type="text" placeholder="Exam ID (e.g. UNIT1-2026)" class="px-3 py-2 border border-gray-300 rounded-lg" required />
          <input v-model="resultForm.examination_name" type="text" placeholder="Exam Name" class="px-3 py-2 border border-gray-300 rounded-lg" required />
          <input v-model="resultForm.subject" type="text" placeholder="Subject" class="px-3 py-2 border border-gray-300 rounded-lg" required />
          <input v-model.number="resultForm.marks_obtained" type="number" min="0" step="0.01" placeholder="Marks Obtained" class="px-3 py-2 border border-gray-300 rounded-lg" required />
          <input v-model.number="resultForm.total_marks" type="number" min="1" step="0.01" placeholder="Total Marks" class="px-3 py-2 border border-gray-300 rounded-lg" required />
          <input v-model="resultForm.grade" type="text" placeholder="Grade" class="px-3 py-2 border border-gray-300 rounded-lg" />
          <input v-model="resultForm.exam_date" type="date" class="px-3 py-2 border border-gray-300 rounded-lg" />
          <input v-model="resultForm.remarks" type="text" placeholder="Remarks" class="px-3 py-2 border border-gray-300 rounded-lg md:col-span-2" />
          <button type="submit" :disabled="saving" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {{ saving ? 'Saving...' : 'Save Result' }}
          </button>
        </form>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <input v-model="filters.examination_id" type="text" placeholder="Filter Exam ID" class="px-3 py-2 border border-gray-300 rounded-lg" />
        <input v-model="filters.class" type="text" placeholder="Filter Class" class="px-3 py-2 border border-gray-300 rounded-lg" />
        <input v-model="filters.section" type="text" placeholder="Filter Section" class="px-3 py-2 border border-gray-300 rounded-lg" />
        <input v-model="filters.academic_year" type="text" placeholder="Academic Year" class="px-3 py-2 border border-gray-300 rounded-lg" />
        <button @click="loadResults" :disabled="loading" class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 disabled:opacity-50">
          {{ loading ? 'Loading...' : 'Load Results' }}
        </button>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-800">Results List</h3>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="row in results" :key="row.id">
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ row.first_name }} {{ row.last_name }}
                <div class="text-xs text-gray-500">{{ row.admission_number }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ row.class }}{{ row.section ? `-${row.section}` : '' }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ row.examination_name }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ row.subject }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ row.marks_obtained }} / {{ row.total_marks }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ row.grade || '-' }}</td>
              <td class="px-6 py-4 text-sm text-gray-700">{{ toPercent(row.marks_obtained, row.total_marks) }}</td>
            </tr>
            <tr v-if="!results.length">
              <td colspan="7" class="px-6 py-6 text-center text-sm text-gray-500">No exam results found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import studentService, { type ExamResult } from '../services/student.service'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const canManage = computed(() => authStore.user?.role === 'admin' || authStore.user?.role === 'teacher')

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const results = ref<ExamResult[]>([])

const filters = ref({
  examination_id: '',
  class: '',
  section: '',
  academic_year: ''
})

const resultForm = ref({
  student_id: '',
  examination_id: '',
  examination_name: '',
  subject: '',
  marks_obtained: 0,
  total_marks: 100,
  grade: '',
  remarks: '',
  exam_date: ''
})

function toPercent(obtained: number, total: number) {
  if (!total) return '0%'
  return `${((obtained / total) * 100).toFixed(2)}%`
}

async function loadResults() {
  loading.value = true
  error.value = ''

  try {
    const response = await studentService.getExamResults({
      examination_id: filters.value.examination_id || undefined,
      class: filters.value.class || undefined,
      section: filters.value.section || undefined,
      academic_year: filters.value.academic_year || undefined,
      limit: 500
    })

    results.value = response.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load results'
    results.value = []
  } finally {
    loading.value = false
  }
}

async function saveResult() {
  if (!canManage.value) return

  saving.value = true
  error.value = ''

  try {
    await studentService.upsertExamResult({
      student_id: resultForm.value.student_id,
      examination_id: resultForm.value.examination_id,
      examination_name: resultForm.value.examination_name,
      subject: resultForm.value.subject,
      marks_obtained: Number(resultForm.value.marks_obtained),
      total_marks: Number(resultForm.value.total_marks),
      grade: resultForm.value.grade || undefined,
      remarks: resultForm.value.remarks || undefined,
      exam_date: resultForm.value.exam_date || undefined
    })

    await loadResults()
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save result'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadResults()
})
</script>

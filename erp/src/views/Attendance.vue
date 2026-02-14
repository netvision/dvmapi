<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Student Attendance</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            v-model="filters.attendance_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
          <input
            v-model="filters.class"
            type="text"
            placeholder="e.g., X"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
          <input
            v-model="filters.section"
            type="text"
            placeholder="e.g., A"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="loadAttendance"
            :disabled="loading"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {{ loading ? 'Loading...' : 'Load Students' }}
          </button>
        </div>
      </div>

      <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
    </div>

    <div v-if="students.length" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-lg font-medium text-gray-800">Attendance Records</h3>
        <button
          @click="saveAttendance"
          :disabled="saving"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Attendance' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admission No.</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="student in students" :key="student.id">
              <td class="px-6 py-4 text-sm text-gray-700">{{ student.admission_number }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ student.first_name }} {{ student.last_name }}</td>
              <td class="px-6 py-4">
                <select
                  v-model="attendanceMap[student.id].status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half-day</option>
                  <option value="leave">Leave</option>
                  <option value="holiday">Holiday</option>
                </select>
              </td>
              <td class="px-6 py-4">
                <input
                  v-model="attendanceMap[student.id].remarks"
                  type="text"
                  placeholder="Optional remarks"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import studentService, { type AttendanceRecordInput } from '../services/student.service'

interface AttendanceStudent {
  id: string
  admission_number: string
  first_name: string
  last_name: string
  status?: AttendanceRecordInput['status']
  remarks?: string
}

const today = new Date().toISOString().split('T')[0]

const filters = ref({
  attendance_date: today,
  class: '',
  section: ''
})

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const students = ref<AttendanceStudent[]>([])
const attendanceMap = ref<Record<string, { status: AttendanceRecordInput['status']; remarks: string }>>({})

async function loadAttendance() {
  loading.value = true
  error.value = ''

  try {
    const response = await studentService.getAttendanceByClassDate({
      attendance_date: filters.value.attendance_date,
      class: filters.value.class,
      section: filters.value.section || undefined
    })

    students.value = response.data.students

    const map: Record<string, { status: AttendanceRecordInput['status']; remarks: string }> = {}
    for (const student of students.value) {
      map[student.id] = {
        status: (student.status as AttendanceRecordInput['status']) || 'present',
        remarks: student.remarks || ''
      }
    }

    attendanceMap.value = map
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load attendance data'
    students.value = []
    attendanceMap.value = {}
  } finally {
    loading.value = false
  }
}

async function saveAttendance() {
  saving.value = true
  error.value = ''

  try {
    const records: AttendanceRecordInput[] = students.value.map((student) => ({
      student_id: student.id,
      status: attendanceMap.value[student.id]?.status || 'present',
      remarks: attendanceMap.value[student.id]?.remarks || ''
    }))

    await studentService.markAttendance({
      attendance_date: filters.value.attendance_date,
      class: filters.value.class,
      section: filters.value.section || undefined,
      records
    })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save attendance'
  } finally {
    saving.value = false
  }
}
</script>

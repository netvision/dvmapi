<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

      <div class="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl">
        <!-- Header -->
        <div class="bg-primary-600 px-6 py-4 flex items-center justify-between">
          <h3 class="text-lg font-medium text-white">Student Details</h3>
          <button @click="$emit('close')" class="text-white hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="student" class="p-6">
          <!-- Student Header -->
          <div class="flex items-center justify-between mb-6 pb-6 border-b">
            <div class="flex items-center gap-4">
              <div class="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
                <span class="text-primary-600 font-bold text-2xl">
                  {{ student.first_name[0] }}{{ student.last_name[0] }}
                </span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ student.first_name }} {{ student.middle_name }} {{ student.last_name }}
                </h2>
                <p class="text-gray-600">{{ student.admission_number }}</p>
                <span
                  :class="{
                    'bg-green-100 text-green-800': student.status === 'active',
                    'bg-gray-100 text-gray-800': student.status === 'inactive',
                    'bg-blue-100 text-blue-800': student.status === 'alumni',
                    'bg-yellow-100 text-yellow-800': student.status === 'transferred'
                  }"
                  class="inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full"
                >
                  {{ student.status }}
                </span>
              </div>
            </div>
            <button
              @click="$emit('edit', student)"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Edit
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Personal Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Personal Information</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-600">Date of Birth</p>
                  <p class="font-medium">{{ formatDate(student.date_of_birth) }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Gender</p>
                  <p class="font-medium capitalize">{{ student.gender }}</p>
                </div>
                <div v-if="student.blood_group">
                  <p class="text-sm text-gray-600">Blood Group</p>
                  <p class="font-medium">{{ student.blood_group }}</p>
                </div>
                <div v-if="student.religion">
                  <p class="text-sm text-gray-600">Religion</p>
                  <p class="font-medium">{{ student.religion }}</p>
                </div>
                <div v-if="student.category">
                  <p class="text-sm text-gray-600">Category</p>
                  <p class="font-medium uppercase">{{ student.category }}</p>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
              <div class="space-y-2">
                <div v-if="student.email">
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="font-medium">{{ student.email }}</p>
                </div>
                <div v-if="student.phone">
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-medium">{{ student.phone }}</p>
                </div>
                <div v-if="student.address">
                  <p class="text-sm text-gray-600">Address</p>
                  <p class="font-medium">{{ student.address }}</p>
                  <p v-if="student.city || student.state" class="font-medium text-gray-700">
                    {{ student.city }}{{ student.city && student.state ? ', ' : '' }}{{ student.state }} {{ student.pincode }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Academic Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Academic Information</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-600">Class</p>
                  <p class="font-medium">Class {{ student.class }}{{ student.section }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Roll Number</p>
                  <p class="font-medium">{{ student.roll_number || 'Not assigned' }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Academic Year</p>
                  <p class="font-medium">{{ student.academic_year }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Admission Date</p>
                  <p class="font-medium">{{ formatDate(student.admission_date) }}</p>
                </div>
              </div>
            </div>

            <!-- Parent/Guardian 1 Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Parent/Guardian 1</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-600">Name</p>
                  <p class="font-medium">{{ student.parent1_name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Relation</p>
                  <p class="font-medium">{{ student.parent1_relation }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-medium">{{ student.parent1_phone }}</p>
                </div>
                <div v-if="student.parent1_email">
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="font-medium">{{ student.parent1_email }}</p>
                </div>
                <div v-if="student.parent1_occupation">
                  <p class="text-sm text-gray-600">Occupation</p>
                  <p class="font-medium">{{ student.parent1_occupation }}</p>
                </div>
              </div>
            </div>

            <!-- Parent/Guardian 2 Information -->
            <div v-if="student.parent2_name" class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Parent/Guardian 2</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-600">Name</p>
                  <p class="font-medium">{{ student.parent2_name }}</p>
                </div>
                <div v-if="student.parent2_relation">
                  <p class="text-sm text-gray-600">Relation</p>
                  <p class="font-medium">{{ student.parent2_relation }}</p>
                </div>
                <div v-if="student.parent2_phone">
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-medium">{{ student.parent2_phone }}</p>
                </div>
              </div>
            </div>

            <!-- Emergency Contact -->
            <div v-if="student.emergency_contact_name" class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>
              <div class="space-y-2">
                <div>
                  <p class="text-sm text-gray-600">Name</p>
                  <p class="font-medium">{{ student.emergency_contact_name }}</p>
                </div>
                <div v-if="student.emergency_contact_phone">
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-medium">{{ student.emergency_contact_phone }}</p>
                </div>
                <div v-if="student.emergency_contact_relation">
                  <p class="text-sm text-gray-600">Relation</p>
                  <p class="font-medium">{{ student.emergency_contact_relation }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Medical Information -->
          <div v-if="student.medical_conditions || student.allergies" class="mt-6 pt-6 border-t">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Medical Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-if="student.medical_conditions">
                <p class="text-sm text-gray-600 mb-1">Medical Conditions</p>
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p class="text-sm">{{ student.medical_conditions }}</p>
                </div>
              </div>
              <div v-if="student.allergies">
                <p class="text-sm text-gray-600 mb-1">Allergies</p>
                <div class="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p class="text-sm">{{ student.allergies }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div v-if="student.previous_school || student.notes" class="mt-6 pt-6 border-t">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div class="space-y-3">
              <div v-if="student.previous_school">
                <p class="text-sm text-gray-600">Previous School</p>
                <p class="font-medium">{{ student.previous_school }}</p>
              </div>
              <div v-if="student.notes">
                <p class="text-sm text-gray-600">Notes</p>
                <p class="font-medium">{{ student.notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Student } from '../services/student.service'

defineProps<{
  student: Student | null
}>()

defineEmits<{
  close: []
  edit: [student: Student]
}>()

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

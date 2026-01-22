<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75" @click="$emit('close')"></div>

      <div class="relative inline-block w-full max-w-6xl my-8 bg-white rounded-lg shadow-xl">
        <!-- Header -->
        <div class="bg-primary-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h3 class="text-xl font-medium text-white">
            {{ mode === 'create' ? 'Add New Student' : 'Edit Student' }}
          </h3>
          <button @click="$emit('close')" class="text-white hover:text-gray-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="p-6 max-h-[80vh] overflow-y-auto">
          <!-- Error Message -->
          <div v-if="error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {{ error }}
          </div>

          <div class="space-y-6">
            <!-- Basic Information -->
            <div class="border-b pb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Admission Number *</label>
                  <input v-model="form.admission_number" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                  <input v-model="form.roll_number" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Admission Date *</label>
                  <input v-model="form.admission_date" type="date" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                  <input v-model="form.academic_year" type="text" required placeholder="2025-2026"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input v-model="form.first_name" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                  <input v-model="form.middle_name" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input v-model="form.last_name" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
                  <input v-model="form.date_of_birth" type="date" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select v-model="form.gender" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <input v-model="form.blood_group" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Religion</label>
                  <input v-model="form.religion" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="border-b pb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input v-model="form.email" type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input v-model="form.phone" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                  <input v-model="form.aadhar_number" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input v-model="form.address" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input v-model="form.city" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input v-model="form.state" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <!-- Academic Details -->
            <div class="border-b pb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Academic Details</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Class *</label>
                  <input v-model="form.class" type="text" required placeholder="e.g., NURSERY, I, II, XI"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Section</label>
                  <input v-model="form.section" type="text" placeholder="e.g., A, B"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select v-model="form.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="alumni">Alumni</option>
                    <option value="transferred">Transferred</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
                  <input v-model="form.previous_school_name" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <!-- Parent 1 Information -->
            <div class="border-b pb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Father's Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input v-model="form.parent1_name" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input v-model="form.parent1_phone" type="text" required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input v-model="form.father_email" type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input v-model="form.father_qualification" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input v-model="form.father_profession" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input v-model="form.father_designation" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                  <input v-model.number="form.father_annual_income" type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <!-- Parent 2 Information -->
            <div class="border-b pb-6">
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Mother's Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input v-model="form.parent2_name" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input v-model="form.parent2_phone" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input v-model="form.mother_email" type="email"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input v-model="form.mother_qualification" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                  <input v-model="form.mother_profession" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                  <input v-model="form.mother_designation" type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                  <input v-model.number="form.mother_annual_income" type="number"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
            </div>

            <!-- Medical Information -->
            <div>
              <h4 class="text-lg font-semibold text-gray-900 mb-4">Medical & Other Information</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                  <textarea v-model="form.medical_conditions" rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <textarea v-model="form.allergies" rows="2"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button type="button" @click="$emit('close')"
              class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" :disabled="saving"
              class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {{ saving ? 'Saving...' : (mode === 'create' ? 'Create Student' : 'Update Student') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import studentService, { type Student } from '@/services/student.service'

const props = defineProps<{
  student?: Student | null
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const form = ref({
  admission_number: '',
  roll_number: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  blood_group: '',
  religion: '',
  email: '',
  phone: '',
  aadhar_number: '',
  address: '',
  city: '',
  state: '',
  class: '',
  section: '',
  academic_year: '2025-2026',
  admission_date: new Date().toISOString().split('T')[0],
  status: 'active',
  previous_school_name: '',
  parent1_name: '',
  parent1_relation: 'Father',
  parent1_phone: '',
  parent1_email: '',
  parent1_occupation: '',
  parent2_name: '',
  parent2_relation: 'Mother',
  parent2_phone: '',
  parent2_email: '',
  parent2_occupation: '',
  father_email: '',
  father_qualification: '',
  father_profession: '',
  father_designation: '',
  father_annual_income: null,
  mother_email: '',
  mother_qualification: '',
  mother_profession: '',
  mother_designation: '',
  mother_annual_income: null,
  medical_conditions: '',
  allergies: ''
})

const saving = ref(false)
const error = ref('')

// Watch for student data changes
watch(() => props.student, (student) => {
  console.log('Student data changed:', student)
  if (student && props.mode === 'edit') {
    // Populate form with student data - handle all fields
    form.value = {
      admission_number: student.admission_number || '',
      roll_number: student.roll_number || '',
      first_name: student.first_name || '',
      middle_name: student.middle_name || '',
      last_name: student.last_name || '',
      date_of_birth: student.date_of_birth?.split('T')[0] || '',
      gender: student.gender || '',
      blood_group: student.blood_group || '',
      religion: student.religion || '',
      email: student.email || '',
      phone: student.phone || '',
      aadhar_number: student.aadhar_number || '',
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      class: student.class || '',
      section: student.section || '',
      academic_year: student.academic_year || '2025-2026',
      admission_date: student.admission_date?.split('T')[0] || '',
      status: student.status || 'active',
      previous_school_name: student.previous_school_name || student.previous_school || '',
      parent1_name: student.parent1_name || '',
      parent1_relation: student.parent1_relation || 'Father',
      parent1_phone: student.parent1_phone || '',
      parent1_email: student.parent1_email || '',
      parent1_occupation: student.parent1_occupation || '',
      parent2_name: student.parent2_name || '',
      parent2_relation: student.parent2_relation || 'Mother',
      parent2_phone: student.parent2_phone || '',
      parent2_email: student.parent2_email || '',
      parent2_occupation: student.parent2_occupation || '',
      father_email: student.father_email || '',
      father_qualification: student.father_qualification || '',
      father_profession: student.father_profession || '',
      father_designation: student.father_designation || '',
      father_annual_income: student.father_annual_income || null,
      mother_email: student.mother_email || '',
      mother_qualification: student.mother_qualification || '',
      mother_profession: student.mother_profession || '',
      mother_designation: student.mother_designation || '',
      mother_annual_income: student.mother_annual_income || null,
      medical_conditions: student.medical_conditions || '',
      allergies: student.allergies || ''
    }
    console.log('Form populated with data:', form.value)
  }
}, { immediate: true, deep: true })

// Watch for mode changes to reset form on create
watch(() => props.mode, (mode) => {
  console.log('Mode changed to:', mode)
  if (mode === 'create') {
    // Reset form for create mode
    form.value = {
      admission_number: '',
      roll_number: '',
      first_name: '',
      middle_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      blood_group: '',
      religion: '',
      email: '',
      phone: '',
      aadhar_number: '',
      address: '',
      city: '',
      state: '',
      class: '',
      section: '',
      academic_year: '2025-2026',
      admission_date: new Date().toISOString().split('T')[0],
      status: 'active',
      previous_school_name: '',
      parent1_name: '',
      parent1_relation: 'Father',
      parent1_phone: '',
      parent1_email: '',
      parent1_occupation: '',
      parent2_name: '',
      parent2_relation: 'Mother',
      parent2_phone: '',
      parent2_email: '',
      parent2_occupation: '',
      father_email: '',
      father_qualification: '',
      father_profession: '',
      father_designation: '',
      father_annual_income: null,
      mother_email: '',
      mother_qualification: '',
      mother_profession: '',
      mother_designation: '',
      mother_annual_income: null,
      medical_conditions: '',
      allergies: ''
    }
  }
})

async function handleSubmit() {
  saving.value = true
  error.value = ''

  try {
    if (props.mode === 'create') {
      await studentService.create(form.value)
    } else if (props.student?.id) {
      await studentService.update(props.student.id, form.value)
    }
    emit('saved')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to save student'
  } finally {
    saving.value = false
  }
}
</script>

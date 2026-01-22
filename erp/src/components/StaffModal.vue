<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-4">{{ isEdit ? 'Edit Staff' : 'Add Staff' }}</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Employee ID *</label>
              <input v-model="formData.employee_id" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Staff Type *</label>
              <select v-model="formData.staff_type" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="teaching">Teaching</option>
                <option value="non-teaching">Non-Teaching</option>
                <option value="administrative">Administrative</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input v-model="formData.first_name" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input v-model="formData.last_name" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input v-model="formData.email" type="email" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input v-model="formData.phone" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input v-model="formData.date_of_birth" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
              <select v-model="formData.gender" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Designation *</label>
              <input v-model="formData.designation" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input v-model="formData.department" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date of Joining *</label>
              <input v-model="formData.date_of_joining" type="date" required class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Employment Type *</label>
              <select v-model="formData.employment_type" required class="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
                <option value="part-time">Part-Time</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
              <input v-model.number="formData.basic_salary" type="number" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input v-model="formData.highest_qualification" class="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              Cancel
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              {{ isEdit ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { staffService, type Staff } from '@/services/staff.service';

const props = defineProps<{
  staff?: Staff | null;
}>();

const emit = defineEmits(['close', 'saved']);

const isEdit = computed(() => !!props.staff?.id);

const initialFormData = () => ({
  employee_id: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  gender: 'male',
  staff_type: 'teaching',
  designation: '',
  department: '',
  date_of_joining: '',
  employment_type: 'permanent',
  basic_salary: 0,
  highest_qualification: '',
  nationality: 'Indian',
  status: 'active'
});

const formData = ref(initialFormData());

watch(() => props.staff, (newVal) => {
  if (newVal?.id) {
    // Edit mode - populate form with staff data
    Object.assign(formData.value, {
      ...newVal,
      // Convert date formats from YYYY-MM-DD to date input format
      date_of_birth: newVal.date_of_birth?.split('T')[0] || newVal.date_of_birth || '',
      date_of_joining: newVal.date_of_joining?.split('T')[0] || newVal.date_of_joining || ''
    });
  } else {
    // Create mode - reset form
    formData.value = initialFormData();
  }
}, { immediate: true });

const handleSubmit = async () => {
  try {
    if (isEdit.value && props.staff?.id) {
      await staffService.update(props.staff.id, formData.value);
    } else {
      await staffService.create(formData.value);
    }
    emit('saved');
  } catch (error) {
    console.error('Error saving staff:', error);
    alert('Failed to save staff member');
  }
};
</script>

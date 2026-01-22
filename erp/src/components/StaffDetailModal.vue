<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold">Staff Details</h2>
          <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <div v-if="staff" class="space-y-6">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-sm text-gray-600">Employee ID</div>
              <div class="font-semibold">{{ staff.employee_id }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Name</div>
              <div class="font-semibold">{{ staff.first_name }} {{ staff.last_name }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Email</div>
              <div class="font-semibold">{{ staff.email }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Phone</div>
              <div class="font-semibold">{{ staff.phone }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Designation</div>
              <div class="font-semibold">{{ staff.designation }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Department</div>
              <div class="font-semibold">{{ staff.department || '-' }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Staff Type</div>
              <div class="font-semibold capitalize">{{ staff.staff_type }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Employment Type</div>
              <div class="font-semibold capitalize">{{ staff.employment_type }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Date of Joining</div>
              <div class="font-semibold">{{ new Date(staff.date_of_joining).toLocaleDateString() }}</div>
            </div>
            <div>
              <div class="text-sm text-gray-600">Status</div>
              <div class="font-semibold capitalize">{{ staff.status }}</div>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button @click="$emit('close')" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
              Close
            </button>
            <button @click="$emit('edit', staff)" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { staffService, type Staff } from '@/services/staff.service';

const props = defineProps<{
  staffId: string;
}>();

const emit = defineEmits(['close', 'edit']);

const staff = ref<Staff | null>(null);

onMounted(async () => {
  try {
    staff.value = await staffService.getById(props.staffId);
  } catch (error) {
    console.error('Error loading staff:', error);
  }
});
</script>

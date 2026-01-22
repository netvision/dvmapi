<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Staff Management</h1>
      <button
        @click="openAddModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        <span>+</span>
        Add Staff
      </button>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Total Staff</div>
        <div class="text-2xl font-bold text-blue-600">{{ stats.total_staff || 0 }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Teaching</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.total_teaching || 0 }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Non-Teaching</div>
        <div class="text-2xl font-bold text-purple-600">{{ stats.total_non_teaching || 0 }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Administrative</div>
        <div class="text-2xl font-bold text-orange-600">{{ stats.total_administrative || 0 }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <input
          v-model="filters.search"
          @input="loadStaff"
          type="text"
          placeholder="Search by name, email, employee ID..."
          class="border border-gray-300 rounded-lg px-4 py-2"
        />
        <select v-model="filters.staff_type" @change="loadStaff" class="border border-gray-300 rounded-lg px-4 py-2">
          <option value="">All Types</option>
          <option value="teaching">Teaching</option>
          <option value="non-teaching">Non-Teaching</option>
          <option value="administrative">Administrative</option>
          <option value="support">Support</option>
        </select>
        <select v-model="filters.status" @change="loadStaff" class="border border-gray-300 rounded-lg px-4 py-2">
          <option value="active">Active</option>
          <option value="on-leave">On Leave</option>
          <option value="resigned">Resigned</option>
          <option value="retired">Retired</option>
        </select>
        <select v-model="filters.employment_type" @change="loadStaff" class="border border-gray-300 rounded-lg px-4 py-2">
          <option value="">All Employment Types</option>
          <option value="permanent">Permanent</option>
          <option value="contract">Contract</option>
          <option value="temporary">Temporary</option>
          <option value="part-time">Part-Time</option>
        </select>
        <button
          @click="resetFilters"
          class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- Staff Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Designation</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="staff in staffList" :key="staff.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ staff.employee_id }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ staff.first_name }} {{ staff.last_name }}</div>
                <div class="text-sm text-gray-500">{{ staff.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ staff.designation }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ staff.department || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full" :class="getTypeClass(staff.staff_type)">
                  {{ staff.staff_type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ staff.phone }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full" :class="getStatusClass(staff.status)">
                  {{ staff.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button @click="viewStaff(staff)" class="text-blue-600 hover:text-blue-900">View</button>
                <button @click="editStaff(staff)" class="text-green-600 hover:text-green-900">Edit</button>
                <button @click="deleteStaff(staff)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-gray-50 px-6 py-4 flex items-center justify-between">
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.currentPage - 1) * pagination.limit + 1 }} to 
          {{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount) }} of 
          {{ pagination.totalCount }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="loadPage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage === 1"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="loadPage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage >= pagination.totalPages"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <StaffModal
      v-if="showModal"
      :staff="selectedStaff"
      @close="showModal = false"
      @saved="handleSaved"
    />
    <StaffDetailModal
      v-if="showDetailModal"
      :staff-id="selectedStaff?.id || ''"
      @close="showDetailModal = false"
      @edit="editStaff"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { staffService, type Staff } from '@/services/staff.service';
import StaffModal from '@/components/StaffModal.vue';
import StaffDetailModal from '@/components/StaffDetailModal.vue';

const staffList = ref<Staff[]>([]);
const stats = ref<any>({});
const filters = reactive({
  search: '',
  staff_type: '',
  status: 'active',
  employment_type: ''
});
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  limit: 50
});

const showModal = ref(false);
const showDetailModal = ref(false);
const selectedStaff = ref<Staff | null>(null);

const loadStaff = async () => {
  try {
    const response = await staffService.getAll({
      page: pagination.value.currentPage,
      limit: pagination.value.limit,
      ...filters
    });
    staffList.value = response.data;
    pagination.value = response.pagination;
  } catch (error) {
    console.error('Error loading staff:', error);
  }
};

const loadStats = async () => {
  try {
    stats.value = await staffService.getStatistics();
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const loadPage = (page: number) => {
  pagination.value.currentPage = page;
  loadStaff();
};

const resetFilters = () => {
  filters.search = '';
  filters.staff_type = '';
  filters.status = 'active';
  filters.employment_type = '';
  pagination.value.currentPage = 1;
  loadStaff();
};

const openAddModal = () => {
  selectedStaff.value = null;
  showModal.value = true;
};

const viewStaff = (staff: Staff) => {
  selectedStaff.value = staff;
  showDetailModal.value = true;
};

const editStaff = (staff: Staff) => {
  selectedStaff.value = staff;
  showDetailModal.value = false;
  showModal.value = true;
};

const deleteStaff = async (staff: Staff) => {
  if (confirm(`Are you sure you want to mark ${staff.first_name} ${staff.last_name} as resigned?`)) {
    try {
      await staffService.delete(staff.id);
      loadStaff();
      loadStats();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member');
    }
  }
};

const handleSaved = () => {
  showModal.value = false;
  loadStaff();
  loadStats();
};

const getTypeClass = (type: string) => {
  const classes: Record<string, string> = {
    teaching: 'bg-blue-100 text-blue-800',
    'non-teaching': 'bg-purple-100 text-purple-800',
    administrative: 'bg-orange-100 text-orange-800',
    support: 'bg-gray-100 text-gray-800'
  };
  return classes[type] || 'bg-gray-100 text-gray-800';
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    'on-leave': 'bg-yellow-100 text-yellow-800',
    suspended: 'bg-red-100 text-red-800',
    resigned: 'bg-gray-100 text-gray-800',
    retired: 'bg-blue-100 text-blue-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

onMounted(() => {
  loadStaff();
  loadStats();
});
</script>

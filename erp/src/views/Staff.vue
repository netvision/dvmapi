<template>
  <div class="space-y-5">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Staff</h1>
        <p class="page-subtitle">{{ stats.total_staff || 0 }} total members</p>
      </div>
      <button @click="openAddModal" class="btn-primary">
        <Plus :size="15" />
        Add Staff
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Total</p>
        <p class="text-2xl font-bold text-slate-900 mt-1.5">{{ stats.total_staff || 0 }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Teaching</p>
        <p class="text-2xl font-bold text-emerald-600 mt-1.5">{{ stats.total_teaching || 0 }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Non-Teaching</p>
        <p class="text-2xl font-bold text-violet-600 mt-1.5">{{ stats.total_non_teaching || 0 }}</p>
      </div>
      <div class="stat-card">
        <p class="text-xs text-slate-500 font-medium uppercase tracking-wide">Administrative</p>
        <p class="text-2xl font-bold text-orange-600 mt-1.5">{{ stats.total_administrative || 0 }}</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-48">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="filters.search"
            @input="loadStaff"
            type="text"
            placeholder="Search by name, email, employee ID…"
            class="form-input pl-8"
          />
        </div>
        <select v-model="filters.staff_type" @change="loadStaff" class="form-input w-40">
          <option value="">All Types</option>
          <option value="teaching">Teaching</option>
          <option value="non-teaching">Non-Teaching</option>
          <option value="administrative">Administrative</option>
          <option value="support">Support</option>
        </select>
        <select v-model="filters.status" @change="loadStaff" class="form-input w-36">
          <option value="active">Active</option>
          <option value="on-leave">On Leave</option>
          <option value="resigned">Resigned</option>
          <option value="retired">Retired</option>
        </select>
        <select v-model="filters.employment_type" @change="loadStaff" class="form-input w-44">
          <option value="">All Employment</option>
          <option value="permanent">Permanent</option>
          <option value="contract">Contract</option>
          <option value="temporary">Temporary</option>
          <option value="part-time">Part-Time</option>
        </select>
        <button @click="resetFilters" class="btn-secondary">
          <RotateCcw :size="14" />
          Reset
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Type</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="staff in staffList" :key="staff.id">
              <td class="font-mono text-xs text-slate-500">{{ staff.employee_id }}</td>
              <td>
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {{ (staff.first_name?.[0] || '') + (staff.last_name?.[0] || '') }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{{ staff.first_name }} {{ staff.last_name }}</p>
                    <p class="text-xs text-slate-400">{{ staff.email }}</p>
                  </div>
                </div>
              </td>
              <td>{{ staff.designation }}</td>
              <td class="text-slate-500">{{ staff.department || '—' }}</td>
              <td>
                <span class="badge" :class="getTypeClass(staff.staff_type)">{{ staff.staff_type }}</span>
              </td>
              <td class="text-slate-500">{{ staff.phone }}</td>
              <td>
                <span class="badge" :class="getStatusClass(staff.status)">{{ staff.status }}</span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button @click="viewStaff(staff)" class="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="View">
                    <Eye :size="14" />
                  </button>
                  <button @click="editStaff(staff)" class="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Edit">
                    <Pencil :size="14" />
                  </button>
                  <button @click="deleteStaff(staff)" class="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
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
          {{ (pagination.currentPage - 1) * pagination.limit + 1 }}–{{ Math.min(pagination.currentPage * pagination.limit, pagination.totalCount) }} of {{ pagination.totalCount }}
        </p>
        <div class="flex gap-2">
          <button @click="loadPage(pagination.currentPage - 1)" :disabled="pagination.currentPage === 1" class="btn-secondary py-1.5 px-3 disabled:opacity-40">
            <ChevronLeft :size="14" />
          </button>
          <button @click="loadPage(pagination.currentPage + 1)" :disabled="pagination.currentPage >= pagination.totalPages" class="btn-secondary py-1.5 px-3 disabled:opacity-40">
            <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <StaffModal v-if="showModal" :staff="selectedStaff" @close="showModal = false" @saved="handleSaved" />
    <StaffDetailModal v-if="showDetailModal" :staff-id="selectedStaff?.id || ''" @close="showDetailModal = false" @edit="editStaff" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { staffService, type Staff } from '@/services/staff.service';
import StaffModal from '@/components/StaffModal.vue';
import StaffDetailModal from '@/components/StaffDetailModal.vue';
import { Plus, Search, RotateCcw, Eye, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next';

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
    teaching: 'bg-blue-50 text-blue-700',
    'non-teaching': 'bg-violet-50 text-violet-700',
    administrative: 'bg-orange-50 text-orange-700',
    support: 'bg-slate-100 text-slate-600'
  };
  return classes[type] || 'bg-slate-100 text-slate-600';
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    'on-leave': 'bg-amber-50 text-amber-700',
    suspended: 'bg-red-50 text-red-700',
    resigned: 'bg-slate-100 text-slate-500',
    retired: 'bg-blue-50 text-blue-700'
  };
  return classes[status] || 'bg-slate-100 text-slate-600';
};

onMounted(() => {
  loadStaff();
  loadStats();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-800">Achievers Management</h1>
        <p class="text-gray-600 mt-1">Manage student achievements and awards</p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Achiever
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select v-model="filters.category" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="">All Categories</option>
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
            <option value="Cultural">Cultural</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <input
            v-model.number="filters.year"
            type="number"
            placeholder="All Years"
            class="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filters.is_active" class="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="all">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="loadAchievers"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>

    <!-- Achievers Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
      </div>

      <div v-else-if="achievers.length === 0" class="text-center py-12 text-gray-500">
        No achievers found
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Photo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Achievement</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="achiever in achievers" :key="achiever.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <img
                v-if="achiever.photo_url"
                :src="achiever.photo_url"
                :alt="achiever.name"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div v-else class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm font-medium text-gray-900">{{ achiever.name }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900 max-w-xs truncate">{{ achiever.achievement }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="{
                  'bg-blue-100 text-blue-800': achiever.category === 'Academic',
                  'bg-green-100 text-green-800': achiever.category === 'Sports',
                  'bg-purple-100 text-purple-800': achiever.category === 'Cultural',
                  'bg-gray-100 text-gray-800': achiever.category === 'Other'
                }"
              >
                {{ achiever.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ achiever.year }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ achiever.display_order }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="achiever.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ achiever.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="openEditModal(achiever)"
                class="text-primary-600 hover:text-primary-900 mr-3"
              >
                Edit
              </button>
              <button
                @click="handleDelete(achiever.id)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page === pagination.totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing page <span class="font-medium">{{ pagination.page }}</span> of <span class="font-medium">{{ pagination.totalPages }}</span>
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                v-for="page in visiblePages"
                :key="page"
                @click="changePage(page)"
                :class="[
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                  page === pagination.page
                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form @submit.prevent="handleSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ isEditMode ? 'Edit Achiever' : 'Add New Achiever' }}
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Student or team name"
                  />
                </div>

                <div>
                  <ImageUpload
                    label="Photo"
                    v-model="formData.photo_url"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Achievement *</label>
                  <textarea
                    v-model="formData.achievement"
                    required
                    rows="3"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Description of the achievement"
                  ></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      v-model="formData.category"
                      required
                      class="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select Category</option>
                      <option value="Academic">Academic</option>
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                    <input
                      v-model.number="formData.year"
                      type="number"
                      required
                      min="2000"
                      max="2100"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                    <input
                      v-model.number="formData.display_order"
                      type="number"
                      min="0"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      v-model="formData.is_active"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option :value="true">Active</option>
                      <option :value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="submitting"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ submitting ? 'Saving...' : (isEditMode ? 'Update' : 'Create') }}
              </button>
              <button
                type="button"
                @click="closeModal"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import * as cmsService from '../services/cms.service'
import ImageUpload from '../components/ImageUpload.vue'
import type { Achiever } from '../services/cms.service'

const achievers = ref<Achiever[]>([])
const loading = ref(false)
const showModal = ref(false)
const isEditMode = ref(false)
const submitting = ref(false)
const currentAchieverId = ref<string | null>(null)

const filters = ref({
  category: '',
  year: null as number | null,
  is_active: 'all' as 'all' | 'true' | 'false'
})

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

const formData = ref({
  name: '',
  photo_url: '',
  achievement: '',
  category: '',
  year: new Date().getFullYear(),
  display_order: 0,
  is_active: true
})

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = pagination.value.totalPages
  const current = pagination.value.page
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push(-1, total)
    } else if (current >= total - 3) {
      pages.push(1, -1)
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, -1)
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push(-1, total)
    }
  }
  
  return pages
})

const loadAchievers = async () => {
  try {
    loading.value = true
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit,
      is_active: filters.value.is_active
    }
    
    if (filters.value.category) params.category = filters.value.category
    if (filters.value.year) params.year = filters.value.year
    
    const response = await cmsService.getAchievers(params)
    achievers.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load achievers:', error)
    alert('Failed to load achievers')
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEditMode.value = false
  currentAchieverId.value = null
  formData.value = {
    name: '',
    photo_url: '',
    achievement: '',
    category: '',
    year: new Date().getFullYear(),
    display_order: 0,
    is_active: true
  }
  showModal.value = true
}

const openEditModal = (achiever: Achiever) => {
  isEditMode.value = true
  currentAchieverId.value = achiever.id
  formData.value = {
    name: achiever.name,
    photo_url: achiever.photo_url || '',
    achievement: achiever.achievement,
    category: achiever.category,
    year: achiever.year,
    display_order: achiever.display_order,
    is_active: achiever.is_active
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    if (isEditMode.value && currentAchieverId.value) {
      await cmsService.updateAchiever(currentAchieverId.value, formData.value)
      alert('Achiever updated successfully')
    } else {
      await cmsService.createAchiever(formData.value)
      alert('Achiever created successfully')
    }
    
    closeModal()
    loadAchievers()
  } catch (error) {
    console.error('Failed to save achiever:', error)
    alert('Failed to save achiever')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async (id: string) => {
  if (!confirm('Are you sure you want to delete this achiever?')) {
    return
  }
  
  try {
    await cmsService.deleteAchiever(id)
    alert('Achiever deleted successfully')
    loadAchievers()
  } catch (error) {
    console.error('Failed to delete achiever:', error)
    alert('Failed to delete achiever')
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page
    loadAchievers()
  }
}

onMounted(() => {
  loadAchievers()
})
</script>

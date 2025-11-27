<template>
  <div>
    <!-- Header Actions -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search events..."
          class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          @input="handleSearch"
        />
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          @change="loadEvents"
        >
          <option value="">All Status</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        + Add Event
      </button>
    </div>

    <!-- Events Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="event in events" :key="event.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ event.id }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ event.title }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ event.location || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(event.start_date).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-blue-100 text-blue-800': event.status === 'upcoming',
                  'bg-green-100 text-green-800': event.status === 'ongoing',
                  'bg-gray-100 text-gray-800': event.status === 'completed',
                  'bg-red-100 text-red-800': event.status === 'cancelled'
                }"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ event.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ event.registered_count }}{{ event.capacity ? '/' + event.capacity : '' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openEditModal(event)" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
              <button @click="handleDelete(event.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
          {{ pagination.total }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
        <h3 class="text-xl font-bold mb-4">{{ editingEvent ? 'Edit Event' : 'Create Event' }}</h3>
        
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Title</label>
            <input
              v-model="formData.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Description</label>
            <textarea
              v-model="formData.description"
              rows="4"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Start Date</label>
              <input
                v-model="formData.start_date"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
              />
            </div>
            
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">End Date</label>
              <input
                v-model="formData.end_date"
                type="datetime-local"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Location</label>
            <input
              v-model="formData.location"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Featured Image URL</label>
            <input
              v-model="formData.featured_image_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Capacity</label>
              <input
                v-model.number="formData.capacity"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
              />
            </div>
            
            <div>
              <label class="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                v-model="formData.status"
                class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div class="flex gap-4">
            <button
              type="submit"
              class="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors"
            >
              {{ editingEvent ? 'Update' : 'Create' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import cmsService, { type Event } from '../services/cms.service'

const events = ref<Event[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingEvent = ref<Event | null>(null)
const formData = ref({
  title: '',
  description: '',
  location: '',
  start_date: '',
  end_date: '',
  featured_image_url: '',
  capacity: null as number | null,
  status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
})

onMounted(() => {
  loadEvents()
})

const loadEvents = async () => {
  try {
    const response = await cmsService.getEvents({
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: statusFilter.value || undefined,
      search: searchQuery.value || undefined
    })
    events.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load events:', error)
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadEvents()
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadEvents()
}

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString)
  return date.toISOString().slice(0, 16)
}

const openCreateModal = () => {
  editingEvent.value = null
  formData.value = {
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    featured_image_url: '',
    capacity: null,
    status: 'upcoming'
  }
  showModal.value = true
}

const openEditModal = (event: Event) => {
  editingEvent.value = event
  formData.value = {
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    start_date: formatDateForInput(event.start_date),
    end_date: formatDateForInput(event.end_date),
    featured_image_url: event.featured_image_url || '',
    capacity: event.capacity,
    status: event.status
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEvent.value = null
}

const handleSubmit = async () => {
  try {
    const submitData = {
      ...formData.value,
      start_date: new Date(formData.value.start_date).toISOString(),
      end_date: new Date(formData.value.end_date).toISOString()
    }
    
    if (editingEvent.value) {
      await cmsService.updateEvent(editingEvent.value.id, submitData)
    } else {
      await cmsService.createEvent(submitData)
    }
    closeModal()
    loadEvents()
  } catch (error) {
    console.error('Failed to save event:', error)
    alert('Failed to save event')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this event?')) return
  
  try {
    await cmsService.deleteEvent(id)
    loadEvents()
  } catch (error) {
    console.error('Failed to delete event:', error)
    alert('Failed to delete event')
  }
}
</script>

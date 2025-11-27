<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Events Management</h2>
      <button
        @click="openCreateModal"
        class="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-sm"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create Event
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm flex gap-4 flex-wrap">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search events..."
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-[200px]"
        @input="handleSearch"
      />
      <select
        v-model="statusFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        @change="loadEvents"
      >
        <option value="">All Status</option>
        <option value="upcoming">Upcoming</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>

    <!-- Events Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <img v-if="event.featured_image_url" :src="event.featured_image_url" class="h-10 w-10 rounded object-cover mr-3" />
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ event.title }}</div>
                  <div class="text-sm text-gray-500">{{ event.description?.substring(0, 50) }}...</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(event.start_date) }}</div>
              <div class="text-sm text-gray-500">{{ formatTime(event.start_date) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ event.location || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-green-100 text-green-800': event.status === 'upcoming',
                  'bg-blue-100 text-blue-800': event.status === 'ongoing',
                  'bg-gray-100 text-gray-800': event.status === 'completed',
                  'bg-red-100 text-red-800': event.status === 'cancelled'
                }"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ event.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openEditModal(event)" class="text-green-600 hover:text-green-900 mr-3">Edit</button>
              <button @click="handleDelete(event.id)" class="text-red-600 hover:text-red-900">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Pagination -->
      <div class="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }} to 
          {{ Math.min(pagination.page * pagination.limit, pagination.total) }} of 
          {{ pagination.total }} results
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page === 1"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 class="text-2xl font-bold text-gray-900">{{ editingEvent ? 'Edit Event' : 'Create Event' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <!-- Basic Information -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.title"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter event title"
                />
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  v-model="formData.description"
                  rows="4"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Event description"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Start Date & Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.start_date"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  End Date & Time <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.end_date"
                  type="datetime-local"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  v-model="formData.location"
                  type="text"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Event location"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  v-model.number="formData.capacity"
                  type="number"
                  min="0"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Maximum attendees"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Status <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.status"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Images -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold text-gray-900 border-b pb-2">Images</h4>
            
            <ImageUpload
              label="Cover Image"
              v-model="formData.featured_image_url"
              :required="false"
            />

            <GalleryUpload
              label="Additional Images (Gallery)"
              v-model="formData.gallery"
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {{ editingEvent ? 'Update Event' : 'Create Event' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium"
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
import cmsService from '../services/cms.service'
import ImageUpload from '../components/ImageUpload.vue'
import GalleryUpload from '../components/GalleryUpload.vue'

interface Event {
  id: string
  title: string
  slug: string
  description: string
  location: string
  start_date: string
  end_date: string
  featured_image_url?: string
  capacity?: number
  status: string
}

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
  status: 'upcoming' as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
  gallery: [] as Array<{ url: string; caption: string }>
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatDateTimeLocal = (dateString: string) => {
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
    status: 'upcoming',
    gallery: []
  }
  showModal.value = true
}

const openEditModal = async (event: Event) => {
  editingEvent.value = event
  
  // Fetch full event details including gallery
  try {
    const response = await cmsService.getEventBySlug(event.slug)
    const fullEvent = response.data
    
    formData.value = {
      title: fullEvent.title,
      description: fullEvent.description || '',
      location: fullEvent.location || '',
      start_date: formatDateTimeLocal(fullEvent.start_date),
      end_date: formatDateTimeLocal(fullEvent.end_date),
      featured_image_url: fullEvent.featured_image_url || '',
      capacity: fullEvent.capacity,
      status: fullEvent.status,
      gallery: (fullEvent.gallery || []).map((img: any) => ({
        url: img.image_url,
        caption: img.caption || ''
      }))
    }
  } catch (error) {
    console.error('Failed to load event details:', error)
    // Fallback to basic data if fetch fails
    formData.value = {
      title: event.title,
      description: event.description || '',
      location: event.location || '',
      start_date: formatDateTimeLocal(event.start_date),
      end_date: formatDateTimeLocal(event.end_date),
      featured_image_url: event.featured_image_url || '',
      capacity: event.capacity,
      status: event.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled',
      gallery: []
    }
  }
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingEvent.value = null
}

const handleSubmit = async () => {
  try {
    const data = {
      title: formData.value.title,
      description: formData.value.description,
      location: formData.value.location,
      start_date: new Date(formData.value.start_date).toISOString(),
      end_date: new Date(formData.value.end_date).toISOString(),
      featured_image_url: formData.value.featured_image_url,
      capacity: formData.value.capacity ?? undefined,
      status: formData.value.status,
      gallery: formData.value.gallery
    }

    if (editingEvent.value) {
      await cmsService.updateEvent(editingEvent.value.id as any, data)
    } else {
      await cmsService.createEvent(data)
    }
    
    closeModal()
    loadEvents()
  } catch (error) {
    console.error('Failed to save event:', error)
    alert('Failed to save event')
  }
}

const handleDelete = async (id: string) => {
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { cmsService } from '../../services/cms.service'

interface Event {
  id: number
  title: string
  slug: string
  description: string
  event_date: string
  event_time: string
  location: string
  cover_image: string
  category_id: number
  category_name?: string
  status: string
  is_featured: boolean
  created_at: string
}

interface Category {
  id: number
  name: string
  slug: string
}

const events = ref<Event[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  title: '',
  slug: '',
  description: '',
  event_date: '',
  event_time: '',
  location: '',
  cover_image: '',
  category_id: null as number | null,
  is_featured: false,
  status: 'published'
})

const coverImageFile = ref<File | null>(null)
const uploadingCover = ref(false)

onMounted(async () => {
  await Promise.all([loadEvents(), loadCategories()])
})

const loadEvents = async () => {
  loading.value = true
  try {
    const response = await cmsService.getEvents({ limit: 100 })
    events.value = response.data.events
  } catch (error) {
    console.error('Failed to load events:', error)
    alert('Failed to load events')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await cmsService.getCategories()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const openCreateForm = () => {
  resetForm()
  editingId.value = null
  showForm.value = true
}

const openEditForm = async (event: Event) => {
  try {
    const response = await cmsService.getEventBySlug(event.slug)
    const fullEvent = response.data
    
    form.value = {
      title: fullEvent.title,
      slug: fullEvent.slug,
      description: fullEvent.description,
      event_date: fullEvent.event_date?.split('T')[0] || '',
      event_time: fullEvent.event_time || '',
      location: fullEvent.location || '',
      cover_image: fullEvent.cover_image,
      category_id: fullEvent.category_id,
      is_featured: fullEvent.is_featured,
      status: fullEvent.status
    }
    
    editingId.value = event.id
    showForm.value = true
  } catch (error) {
    console.error('Failed to load event:', error)
    alert('Failed to load event details')
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    slug: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    event_time: '',
    location: '',
    cover_image: '',
    category_id: null,
    is_featured: false,
    status: 'published'
  }
  coverImageFile.value = null
}

const generateSlug = () => {
  if (!form.value.slug && form.value.title) {
    form.value.slug = form.value.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}

const handleCoverImageSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    coverImageFile.value = target.files[0]
  }
}

const uploadCoverImage = async (): Promise<string> => {
  if (!coverImageFile.value) return form.value.cover_image

  uploadingCover.value = true
  try {
    const formData = new FormData()
    formData.append('file', coverImageFile.value)

    const response = await cmsService.uploadSingle(formData, 'events')
    return response.data.url
  } catch (error) {
    console.error('Failed to upload cover image:', error)
    throw new Error('Failed to upload cover image')
  } finally {
    uploadingCover.value = false
  }
}

const handleSubmit = async () => {
  try {
    generateSlug()

    // Upload cover image if new file selected
    if (coverImageFile.value) {
      form.value.cover_image = await uploadCoverImage()
    }

    const data = {
      ...form.value,
      organizer_id: 1 // TODO: Get from auth
    }

    if (editingId.value) {
      await cmsService.updateEvent(editingId.value, data)
    } else {
      await cmsService.createEvent(data)
    }

    alert(editingId.value ? 'Event updated successfully' : 'Event created successfully')
    showForm.value = false
    await loadEvents()
  } catch (error) {
    console.error('Failed to save event:', error)
    alert('Failed to save event')
  }
}

const deleteEvent = async (id: number) => {
  if (!confirm('Are you sure you want to delete this event?')) return

  try {
    await cmsService.deleteEvent(id)
    alert('Event deleted successfully')
    await loadEvents()
  } catch (error) {
    console.error('Failed to delete event:', error)
    alert('Failed to delete event')
  }
}
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Manage Events</h1>
      <button
        @click="openCreateForm"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Create Event
      </button>
    </div>

    <!-- Events List -->
    <div v-if="!showForm" class="bg-white rounded-lg shadow">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        Loading events...
      </div>
      <div v-else-if="events.length === 0" class="p-8 text-center text-gray-500">
        No events found. Create your first event!
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="event.cover_image"
                    :src="event.cover_image"
                    :alt="event.title"
                    class="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div class="font-medium text-gray-900">{{ event.title }}</div>
                    <div class="text-sm text-gray-500">{{ event.slug }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ event.category_name || 'Uncategorized' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    event.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ event.status }}
                </span>
                <span
                  v-if="event.is_featured"
                  class="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                >
                  Featured
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ new Date(event.event_date).toLocaleDateString() }}
                <div v-if="event.event_time" class="text-xs text-gray-400">
                  {{ event.event_time }}
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    @click="openEditForm(event)"
                    class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteEvent(event.id)"
                    class="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Event Form -->
    <div v-if="showForm" class="bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-6">
        {{ editingId ? 'Edit Event' : 'Create Event' }}
      </h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              v-model="form.title"
              type="text"
              required
              @blur="generateSlug"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
            <input
              v-model="form.slug"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            v-model="form.description"
            rows="6"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
          <input
            type="file"
            accept="image/*"
            @change="handleCoverImageSelect"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div v-if="form.cover_image" class="mt-2">
            <img :src="form.cover_image" alt="Cover preview" class="h-32 object-cover rounded" />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
            <input
              v-model="form.event_date"
              type="date"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Event Time</label>
            <input
              v-model="form.event_time"
              type="time"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <select
              v-model="form.category_id"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="null">Select Category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <input
            v-model="form.location"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status *</label>
          <select
            v-model="form.status"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input
              v-model="form.is_featured"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">Featured Event</span>
          </label>
        </div>

        <div class="flex gap-4 pt-4">
          <button
            type="submit"
            :disabled="uploadingCover"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {{ uploadingCover ? 'Uploading...' : (editingId ? 'Update' : 'Create') }}
          </button>
          <button
            type="button"
            @click="showForm = false"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

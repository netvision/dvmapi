<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">Contact Messages</h2>
      <div class="text-sm text-gray-600">
        Total Messages: <span class="font-semibold">{{ pagination.total }}</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm flex gap-4 flex-wrap">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search messages..."
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 min-w-[200px]"
        @input="handleSearch"
      />
      <select
        v-model="statusFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        @change="loadMessages"
      >
        <option value="">All Status</option>
        <option value="new">New</option>
        <option value="read">Read</option>
        <option value="replied">Replied</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <!-- Messages Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading" class="hover:bg-gray-50">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">Loading messages...</td>
          </tr>
          <tr v-else-if="messages.length === 0" class="hover:bg-gray-50">
            <td colspan="6" class="px-6 py-8 text-center text-gray-500">No messages found</td>
          </tr>
          <tr v-else v-for="message in messages" :key="message.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="text-sm">
                <div class="font-medium text-gray-900">{{ message.first_name }} {{ message.last_name }}</div>
                <div class="text-gray-500">{{ message.email }}</div>
                <div class="text-gray-500">{{ message.phone }}</div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ message.subject }}</div>
            </td>
            <td class="px-6 py-4 max-w-xs">
              <div class="text-sm text-gray-900 truncate" :title="message.message">
                {{ message.message.substring(0, 80) }}{{ message.message.length > 80 ? '...' : '' }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                :value="message.status"
                @change="updateStatus(message.id, $event)"
                :class="{
                  'bg-blue-100 text-blue-800': message.status === 'new',
                  'bg-yellow-100 text-yellow-800': message.status === 'read',
                  'bg-green-100 text-green-800': message.status === 'replied',
                  'bg-gray-100 text-gray-800': message.status === 'archived'
                }"
                class="px-2 py-1 text-xs font-semibold rounded-full border-none focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ new Date(message.created_at).toLocaleDateString() }}
              <div class="text-xs text-gray-400">{{ new Date(message.created_at).toLocaleTimeString() }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="openMessageModal(message)" 
                class="text-primary-600 hover:text-primary-900 mr-3"
              >
                View
              </button>
              <button 
                @click="handleDelete(message.id)" 
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
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

    <!-- Message Detail Modal -->
    <div v-if="showModal && selectedMessage" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full">
        <!-- Modal Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-900">Message Details</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
            <div class="text-gray-900">
              {{ selectedMessage.first_name }} {{ selectedMessage.last_name }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <a :href="`mailto:${selectedMessage.email}`" class="text-primary-600 hover:text-primary-800">
                {{ selectedMessage.email }}
              </a>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <a :href="`tel:${selectedMessage.phone}`" class="text-primary-600 hover:text-primary-800">
                {{ selectedMessage.phone }}
              </a>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <div class="text-gray-900 font-medium">{{ selectedMessage.subject }}</div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <div class="bg-gray-50 p-4 rounded-lg text-gray-900 whitespace-pre-wrap">
              {{ selectedMessage.message }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="selectedMessage.status"
                @change="updateStatus(selectedMessage.id, $event)"
                :class="{
                  'bg-blue-100 text-blue-800': selectedMessage.status === 'new',
                  'bg-yellow-100 text-yellow-800': selectedMessage.status === 'read',
                  'bg-green-100 text-green-800': selectedMessage.status === 'replied',
                  'bg-gray-100 text-gray-800': selectedMessage.status === 'archived'
                }"
                class="w-full px-3 py-2 text-sm font-semibold rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              >
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Received On</label>
              <div class="text-gray-900">
                {{ new Date(selectedMessage.created_at).toLocaleString() }}
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <a
            :href="`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Reply via Email
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useContactService } from '../services/contact.service'

const contactService = useContactService()

interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

const messages = ref<ContactMessage[]>([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const selectedMessage = ref<ContactMessage | null>(null)

const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

let searchTimeout: number | null = null

const loadMessages = async () => {
  loading.value = true
  try {
    const params: any = {
      page: pagination.value.page,
      limit: pagination.value.limit
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (statusFilter.value) {
      params.status = statusFilter.value
    }

    const response = await contactService.getMessages(params)
    messages.value = response.data
    pagination.value = response.pagination
  } catch (error: any) {
    console.error('Failed to load messages:', error)
    alert(error.response?.data?.message || 'Failed to load messages')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = window.setTimeout(() => {
    pagination.value.page = 1
    loadMessages()
  }, 500)
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadMessages()
}

const updateStatus = async (id: number, event: Event) => {
  const target = event.target as HTMLSelectElement
  const newStatus = target.value as ContactMessage['status']
  
  try {
    await contactService.updateStatus(id, newStatus)
    
    // Update in list
    const message = messages.value.find(m => m.id === id)
    if (message) {
      message.status = newStatus
    }
    
    // Update in modal if open
    if (selectedMessage.value?.id === id) {
      selectedMessage.value.status = newStatus
    }
  } catch (error: any) {
    console.error('Failed to update status:', error)
    alert(error.response?.data?.message || 'Failed to update status')
    // Revert the select
    if (event.target) {
      const message = messages.value.find(m => m.id === id)
      if (message) {
        (event.target as HTMLSelectElement).value = message.status
      }
    }
  }
}

const openMessageModal = async (message: ContactMessage) => {
  selectedMessage.value = message
  showModal.value = true
  
  // Mark as read if it's new
  if (message.status === 'new') {
    try {
      await contactService.updateStatus(message.id, 'read')
      message.status = 'read'
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }
}

const closeModal = () => {
  showModal.value = false
  selectedMessage.value = null
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this message?')) {
    return
  }

  try {
    await contactService.deleteMessage(id)
    messages.value = messages.value.filter(m => m.id !== id)
    pagination.value.total -= 1
    
    if (showModal.value && selectedMessage.value?.id === id) {
      closeModal()
    }
  } catch (error: any) {
    console.error('Failed to delete message:', error)
    alert(error.response?.data?.message || 'Failed to delete message')
  }
}

onMounted(() => {
  loadMessages()
})
</script>

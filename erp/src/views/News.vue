<template>
  <div>
    <!-- Header Actions -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search news..."
          class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          @input="handleSearch"
        />
        <select
          v-model="statusFilter"
          class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          @change="loadNews"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        + Add News
      </button>
    </div>

    <!-- News Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="article in news" :key="article.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ article.id }}</td>
            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ article.title }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'bg-green-100 text-green-800': article.status === 'published',
                  'bg-yellow-100 text-yellow-800': article.status === 'draft',
                  'bg-gray-100 text-gray-800': article.status === 'archived'
                }"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ article.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ article.views }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ article.published_at ? new Date(article.published_at).toLocaleDateString() : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openEditModal(article)" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
              <button @click="handleDelete(article.id)" class="text-red-600 hover:text-red-900">Delete</button>
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

    <!-- News Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full m-4">
        <h3 class="text-xl font-bold mb-4">{{ editingNews ? 'Edit News' : 'Create News' }}</h3>
        
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
            <label class="block text-gray-700 text-sm font-bold mb-2">Excerpt</label>
            <textarea
              v-model="formData.excerpt"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Content</label>
            <textarea
              v-model="formData.content"
              rows="8"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            ></textarea>
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Featured Image URL</label>
            <input
              v-model="formData.featured_image_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Status</label>
            <select
              v-model="formData.status"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div class="flex gap-4">
            <button
              type="submit"
              class="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors"
            >
              {{ editingNews ? 'Update' : 'Create' }}
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
import cmsService, { type NewsArticle } from '../services/cms.service'

const news = ref<NewsArticle[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editingNews = ref<NewsArticle | null>(null)
const formData = ref({
  title: '',
  excerpt: '',
  content: '',
  featured_image_url: '',
  status: 'draft' as 'draft' | 'published' | 'archived'
})

onMounted(() => {
  loadNews()
})

const loadNews = async () => {
  try {
    const response = await cmsService.getNews({
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: statusFilter.value || undefined,
      search: searchQuery.value || undefined
    })
    news.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load news:', error)
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadNews()
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadNews()
}

const openCreateModal = () => {
  editingNews.value = null
  formData.value = {
    title: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    status: 'draft'
  }
  showModal.value = true
}

const openEditModal = (article: NewsArticle) => {
  editingNews.value = article
  formData.value = {
    title: article.title,
    excerpt: article.excerpt || '',
    content: article.content,
    featured_image_url: article.featured_image_url || '',
    status: article.status
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingNews.value = null
}

const handleSubmit = async () => {
  try {
    if (editingNews.value) {
      await cmsService.updateNews(editingNews.value.id, formData.value)
    } else {
      await cmsService.createNews(formData.value)
    }
    closeModal()
    loadNews()
  } catch (error) {
    console.error('Failed to save news:', error)
    alert('Failed to save news')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this news article?')) return
  
  try {
    await cmsService.deleteNews(id)
    loadNews()
  } catch (error) {
    console.error('Failed to delete news:', error)
    alert('Failed to delete news')
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-800">News Management</h2>
      <button
        @click="openCreateModal"
        class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center shadow-sm"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Create News Article
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow-sm flex gap-4 flex-wrap">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search news..."
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 min-w-[200px]"
        @input="handleSearch"
      />
      <select
        v-model="categoryFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        @change="loadNews"
      >
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
      <select
        v-model="statusFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        @change="loadNews"
      >
        <option value="">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
    </div>

    <!-- News Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="article in news" :key="article.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center">
                <img v-if="article.featured_image_url" :src="article.featured_image_url" class="h-10 w-10 rounded object-cover mr-3" />
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ article.title }}</div>
                  <div class="text-sm text-gray-500">{{ article.excerpt?.substring(0, 50) }}...</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                {{ getCategoryName(article.category_id) }}
              </span>
            </td>
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
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="openEditModal(article)" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
              <button @click="handleDelete(article.id)" class="text-red-600 hover:text-red-900">Delete</button>
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

    <!-- News Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 class="text-2xl font-bold text-gray-900">{{ editingNews ? 'Edit News Article' : 'Create News Article' }}</h3>
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
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter news title"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.category_id"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Category</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Status <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.status"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  v-model="formData.excerpt"
                  rows="2"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief summary (optional)"
                ></textarea>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Content <span class="text-red-500">*</span>
                </label>
                <textarea
                  v-model="formData.content"
                  rows="10"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                  placeholder="Enter full content here"
                ></textarea>
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
              class="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              {{ editingNews ? 'Update Article' : 'Create Article' }}
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

interface NewsArticle {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image_url?: string
  category_id?: string
  status: string
  views: number
  published_at?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

const news = ref<NewsArticle[]>([])
const categories = ref<Category[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const searchQuery = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const showModal = ref(false)
const editingNews = ref<NewsArticle | null>(null)
const formData = ref({
  title: '',
  excerpt: '',
  content: '',
  featured_image_url: '',
  category_id: '',
  status: 'draft',
  gallery: [] as Array<{ url: string; caption: string }>
})

onMounted(() => {
  loadNews()
  loadCategories()
})

const loadCategories = async () => {
  try {
    const response = await cmsService.getNewsCategories()
    categories.value = response.data
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadNews = async () => {
  try {
    const response = await cmsService.getNews({
      page: pagination.value.page,
      limit: pagination.value.limit,
      status: statusFilter.value || undefined,
      search: searchQuery.value || undefined
    })
    news.value = response.data as any
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

const getCategoryName = (categoryId?: string) => {
  if (!categoryId) return 'Uncategorized'
  const category = categories.value.find(c => c.id === categoryId)
  return category?.name || 'Uncategorized'
}

const openCreateModal = () => {
  editingNews.value = null
  formData.value = {
    title: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    category_id: '',
    status: 'draft',
    gallery: []
  }
  showModal.value = true
}

const openEditModal = async (article: NewsArticle) => {
  editingNews.value = article
  
  // Fetch full article details including gallery
  try {
    const response = await cmsService.getNewsBySlug(article.slug)
    const fullArticle = response.data
    
    formData.value = {
      title: fullArticle.title,
      excerpt: fullArticle.excerpt || '',
      content: fullArticle.content,
      featured_image_url: fullArticle.featured_image_url || '',
      category_id: fullArticle.category_id || '',
      status: fullArticle.status,
      gallery: (fullArticle.gallery || []).map((img: any) => ({
        url: img.image_url,
        caption: img.caption || ''
      }))
    }
  } catch (error) {
    console.error('Failed to load article details:', error)
    // Fallback to basic data if fetch fails
    formData.value = {
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content,
      featured_image_url: article.featured_image_url || '',
      category_id: article.category_id || '',
      status: article.status,
      gallery: []
    }
  }
  
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingNews.value = null
}

const handleSubmit = async () => {
  try {
    const data = {
      title: formData.value.title,
      excerpt: formData.value.excerpt,
      content: formData.value.content,
      featured_image_url: formData.value.featured_image_url,
      category_id: formData.value.category_id,
      status: formData.value.status as 'draft' | 'published' | 'archived',
      gallery: formData.value.gallery
    }

    if (editingNews.value) {
      await cmsService.updateNews(editingNews.value.id as any, data)
    } else {
      await cmsService.createNews(data)
    }
    
    closeModal()
    loadNews()
  } catch (error) {
    console.error('Failed to save news:', error)
    alert('Failed to save news article')
  }
}

const handleDelete = async (id: any) => {
  if (!confirm('Are you sure you want to delete this news article?')) return
  
  try {
    await cmsService.deleteNews(id)
    loadNews()
  } catch (error) {
    console.error('Failed to delete news:', error)
    alert('Failed to delete news article')
  }
}
</script>

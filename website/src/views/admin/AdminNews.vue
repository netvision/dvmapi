<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { cmsService } from '../../services/cms.service'

interface NewsArticle {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image: string
  category_id: number
  category_name?: string
  author_id: number
  published_date: string
  is_featured: boolean
  status: string
  created_at: string
}

interface Category {
  id: number
  name: string
  slug: string
}

const news = ref<NewsArticle[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  cover_image: '',
  category_id: null as number | null,
  published_date: '',
  is_featured: false,
  status: 'published'
})

const coverImageFile = ref<File | null>(null)
const uploadingCover = ref(false)

onMounted(async () => {
  await Promise.all([loadNews(), loadCategories()])
})

const loadNews = async () => {
  loading.value = true
  try {
    const response = await cmsService.getNews({ limit: 100 })
    news.value = response.data.articles
  } catch (error) {
    console.error('Failed to load news:', error)
    alert('Failed to load news articles')
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

const openEditForm = async (article: NewsArticle) => {
  try {
    const response = await cmsService.getNewsBySlug(article.slug)
    const fullArticle = response.data
    
    form.value = {
      title: fullArticle.title,
      slug: fullArticle.slug,
      excerpt: fullArticle.excerpt || '',
      content: fullArticle.content,
      cover_image: fullArticle.cover_image,
      category_id: fullArticle.category_id,
      published_date: fullArticle.published_date?.split('T')[0] || '',
      is_featured: fullArticle.is_featured,
      status: fullArticle.status
    }
    
    editingId.value = article.id
    showForm.value = true
  } catch (error) {
    console.error('Failed to load article:', error)
    alert('Failed to load article details')
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_image: '',
    category_id: null,
    published_date: new Date().toISOString().split('T')[0],
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

    const response = await cmsService.uploadSingle(formData, 'news')
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
      author_id: 1 // TODO: Get from auth
    }

    if (editingId.value) {
      await cmsService.updateNews(editingId.value, data)
    } else {
      await cmsService.createNews(data)
    }

    alert(editingId.value ? 'News article updated successfully' : 'News article created successfully')
    showForm.value = false
    await loadNews()
  } catch (error) {
    console.error('Failed to save article:', error)
    alert('Failed to save article')
  }
}

const deleteArticle = async (id: number) => {
  if (!confirm('Are you sure you want to delete this article?')) return

  try {
    await cmsService.deleteNews(id)
    alert('Article deleted successfully')
    await loadNews()
  } catch (error) {
    console.error('Failed to delete article:', error)
    alert('Failed to delete article')
  }
}
</script>

<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Manage News</h1>
      <button
        @click="openCreateForm"
        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        + Create News
      </button>
    </div>

    <!-- News List -->
    <div v-if="!showForm" class="bg-white rounded-lg shadow">
      <div v-if="loading" class="p-8 text-center text-gray-500">
        Loading news articles...
      </div>
      <div v-else-if="news.length === 0" class="p-8 text-center text-gray-500">
        No news articles found. Create your first article!
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="article in news" :key="article.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img
                    v-if="article.cover_image"
                    :src="article.cover_image"
                    :alt="article.title"
                    class="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <div class="font-medium text-gray-900">{{ article.title }}</div>
                    <div class="text-sm text-gray-500">{{ article.slug }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ article.category_name || 'Uncategorized' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    article.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ article.status }}
                </span>
                <span
                  v-if="article.is_featured"
                  class="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                >
                  Featured
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ new Date(article.published_date).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4">
                <div class="flex gap-2">
                  <button
                    @click="openEditForm(article)"
                    class="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteArticle(article.id)"
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

    <!-- News Form -->
    <div v-if="showForm" class="bg-white rounded-lg shadow p-8">
      <h2 class="text-2xl font-bold mb-6">
        {{ editingId ? 'Edit News Article' : 'Create News Article' }}
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
          <label class="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
          <textarea
            v-model="form.excerpt"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Content *</label>
          <textarea
            v-model="form.content"
            rows="10"
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

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Published Date *</label>
            <input
              v-model="form.published_date"
              type="date"
              required
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
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input
              v-model="form.is_featured"
              type="checkbox"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span class="text-sm font-medium text-gray-700">Featured Article</span>
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

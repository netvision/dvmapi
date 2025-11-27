<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <!-- Image Grid -->
    <div v-if="images.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="relative group"
      >
        <img
          :src="image.url"
          :alt="image.caption || `Image ${index + 1}`"
          class="w-full h-32 object-cover rounded-lg"
        />
        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <button
            type="button"
            @click="removeImage(index)"
            class="text-white hover:text-red-400 mx-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        <!-- Caption Input -->
        <input
          v-model="image.caption"
          type="text"
          placeholder="Caption (optional)"
          class="mt-2 w-full text-xs px-2 py-1 border border-gray-300 rounded"
          @input="updateImages"
        />
      </div>
    </div>

    <!-- Upload Button -->
    <div class="flex justify-center">
      <label class="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Images
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          class="sr-only"
          @change="handleFileSelect"
        />
      </label>
    </div>
    <p class="mt-2 text-xs text-gray-500 text-center">You can select multiple images at once (max 5MB each)</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface GalleryImage {
  url: string
  caption: string
}

const props = defineProps<{
  label: string
  modelValue: GalleryImage[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: GalleryImage[]): void
}>()

const fileInput = ref<HTMLInputElement>()
const images = ref<GalleryImage[]>([...props.modelValue])

watch(() => props.modelValue, (newValue) => {
  images.value = [...newValue]
})

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  for (const file of files) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(`${file.name} is too large. Max size is 5MB`)
      continue
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} is not an image file`)
      continue
    }

    // Create preview immediately
    const reader = new FileReader()
    const previewIndex = images.value.length
    reader.onload = (e) => {
      // Temporary preview
      if (images.value[previewIndex]) {
        images.value[previewIndex].url = e.target?.result as string
      }
    }
    reader.readAsDataURL(file)

    // Add placeholder
    images.value.push({
      url: '',
      caption: ''
    })

    // Upload file to server
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('You must be logged in to upload files')
        images.value.splice(previewIndex, 1)
        continue
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
      const response = await fetch(`${apiUrl.replace('/api/v1', '')}/api/v1/core/upload/single?type=news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      // Update with server URL
      images.value[previewIndex].url = result.data.url
      updateImages()
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Failed to upload ${file.name}`)
      images.value.splice(previewIndex, 1)
    }
  }

  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeImage = (index: number) => {
  images.value.splice(index, 1)
  updateImages()
}

const updateImages = () => {
  emit('update:modelValue', images.value)
}
</script>

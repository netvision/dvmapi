<template>
  <div class="space-y-4">
    <!-- Cover Image Upload -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      
      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-400 transition-colors">
        <div class="space-y-1 text-center">
          <!-- Preview -->
          <div v-if="previewUrl" class="mb-4">
            <img :src="previewUrl" alt="Preview" class="mx-auto h-32 w-auto rounded" />
            <button
              type="button"
              @click="removeImage"
              class="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>

          <!-- Upload Icon -->
          <svg v-else class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>

          <div class="flex text-sm text-gray-600">
            <label class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
              <span>Upload a file</span>
              <input
                ref="fileInput"
                type="file"
                class="sr-only"
                accept="image/*"
                @change="handleFileSelect"
              />
            </label>
            <p class="pl-1">or drag and drop</p>
          </div>
          <p class="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  label: string
  modelValue: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const fileInput = ref<HTMLInputElement>()
const previewUrl = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  previewUrl.value = newValue
})

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Create preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)

    // Upload file to server
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('You must be logged in to upload files')
        removeImage()
        return
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
      // Emit the server URL instead of base64
      emit('update:modelValue', result.data.url)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
      removeImage()
    }
  }
}

const removeImage = () => {
  previewUrl.value = ''
  emit('update:modelValue', '')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>

<template>
  <div class="space-y-2">

    <!-- Previews grid -->
    <div v-if="items.length > 0" class="grid gap-2"
      :class="mediaType === 'image' ? 'grid-cols-3 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'">
      <div v-for="(item, idx) in items" :key="idx"
        class="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-50">

        <!-- Image preview -->
        <img v-if="mediaType === 'image'" :src="resolveUrl(item)"
          class="w-full h-24 object-cover" :alt="`Image ${idx + 1}`" />

        <!-- Video preview -->
        <div v-else class="flex items-center gap-2 px-3 py-2.5">
          <Video class="w-5 h-5 flex-shrink-0 text-blue-500" />
          <span class="text-xs text-slate-600 truncate">{{ fileName(item) }}</span>
        </div>

        <!-- Remove overlay -->
        <button type="button" @click="remove(idx)"
          class="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
          <X class="w-3 h-3" />
        </button>

        <!-- Uploading spinner -->
        <div v-if="item === '__uploading__'"
          class="absolute inset-0 flex items-center justify-center bg-white/80">
          <Loader2 class="w-5 h-5 animate-spin text-blue-500" />
        </div>
      </div>
    </div>

    <!-- Upload button -->
    <label class="flex items-center gap-2 cursor-pointer w-fit px-3 py-2 rounded-lg border border-dashed border-slate-300 text-slate-500 text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
      <UploadCloud class="w-4 h-4" />
      <span>{{ mediaType === 'image' ? 'Upload images' : 'Upload videos' }}</span>
      <input ref="fileInput" type="file" multiple class="sr-only"
        :accept="mediaType === 'image' ? 'image/*' : 'video/mp4,video/webm,video/ogg,video/quicktime'"
        @change="handleSelect" />
    </label>

    <p class="text-xs text-slate-400">
      {{ mediaType === 'image' ? 'PNG, JPG, WebP — max 5 MB each' : 'MP4, WebM, MOV — max 100 MB each' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Loader2, UploadCloud, Video, X } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[]      // array of server URLs
  mediaType: 'image' | 'video'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const fileInput = ref<HTMLInputElement>()
const items = ref<string[]>([...props.modelValue])

watch(() => props.modelValue, (v) => { items.value = [...v] })

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')

function resolveUrl(url: string) {
  if (!url || url === '__uploading__') return ''
  if (url.startsWith('http') || url.startsWith('data:')) return url
  return `${API_BASE}${url}`
}

function fileName(url: string) {
  if (!url || url === '__uploading__') return 'Uploading…'
  return url.split('/').pop() || url
}

function remove(idx: number) {
  items.value.splice(idx, 1)
  emit('update:modelValue', [...items.value])
}

async function handleSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  if (!files.length) return

  const maxSize = props.mediaType === 'image' ? 5 * 1024 * 1024 : 100 * 1024 * 1024
  const token = localStorage.getItem('accessToken') || ''

  for (const file of files) {
    if (file.size > maxSize) {
      alert(`${file.name} exceeds the size limit.`)
      continue
    }

    // Placeholder while uploading
    const placeholderIdx = items.value.length
    items.value.push('__uploading__')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_BASE}/api/v1/core/upload/single?type=learning`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) throw new Error('Upload failed')
      const result = await res.json()
      items.value[placeholderIdx] = result.data.url
      emit('update:modelValue', items.value.filter(u => u !== '__uploading__'))
    } catch (err) {
      console.error(err)
      alert(`Failed to upload ${file.name}`)
      items.value.splice(placeholderIdx, 1)
    }
  }

  if (fileInput.value) fileInput.value.value = ''
}
</script>

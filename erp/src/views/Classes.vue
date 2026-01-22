<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Academic Structure</h1>
        <p class="mt-1 text-sm text-gray-600">Manage classes, sections, and academic organization</p>
      </div>
      <button
        @click="openAddClassModal"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Class
      </button>
    </div>

    <!-- Classes Table -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Classes ({{ classes.length }})</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wing</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sections</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cls in classes" :key="cls.id" class="hover:bg-gray-50 cursor-pointer">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ cls.display_name }}</div>
                <div class="text-sm text-gray-500">{{ cls.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{{ cls.level }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ cls.wing || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="viewSections(cls)" class="text-primary-600 hover:text-primary-800 font-medium">
                  {{ cls.total_sections || 0 }} sections
                </button>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ cls.total_students || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ cls.capacity || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="cls.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 py-1 text-xs rounded-full">
                  {{ cls.is_active !== false ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button @click="editClass(cls)" class="text-primary-600 hover:text-primary-800">Edit</button>
                <button @click="deleteClass(cls)" class="text-red-600 hover:text-red-800">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Class Modal -->
    <div v-if="showClassModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">{{ isEditMode ? 'Edit Class' : 'Add Class' }}</h2>
        <form @submit.prevent="saveClass" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <input v-model="classForm.name" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Display Name *</label>
            <input v-model="classForm.display_name" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Level *</label>
            <select v-model="classForm.level" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
              <option value="pre-primary">Pre-Primary</option>
              <option value="primary">Primary</option>
              <option value="middle">Middle</option>
              <option value="secondary">Secondary</option>
              <option value="senior-secondary">Senior Secondary</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Wing</label>
            <input v-model="classForm.wing" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sequence Order *</label>
            <input v-model.number="classForm.sequence_order" type="number" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input v-model.number="classForm.capacity" type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="classForm.description" rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <button type="button" @click="closeClassModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {{ isEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sections Modal -->
    <div v-if="showSectionsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold">Sections - {{ selectedClass?.display_name }}</h2>
            <p class="text-sm text-gray-600">{{ selectedClass?.name }}</p>
          </div>
          <button @click="openAddSectionModal"
            class="bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700 text-sm">
            Add Section
          </button>
        </div>

        <div class="space-y-2">
          <div v-for="section in sections" :key="section.id"
            class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div class="flex-1">
              <div class="font-medium">Section {{ section.name }}</div>
              <div class="text-sm text-gray-600">
                Room: {{ section.room_number || 'Not assigned' }} |
                Students: {{ section.total_students || 0 }} |
                Capacity: {{ section.capacity || '-' }}
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="editSection(section)" class="text-primary-600 hover:text-primary-800 text-sm">Edit</button>
              <button @click="deleteSection(section)" class="text-red-600 hover:text-red-800 text-sm">Delete</button>
            </div>
          </div>
        </div>

        <div class="flex justify-end mt-4">
          <button @click="closeSectionsModal"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>

    <!-- Section Modal -->
    <div v-if="showSectionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div class="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">{{ isSectionEditMode ? 'Edit Section' : 'Add Section' }}</h2>
        <form @submit.prevent="saveSection" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Section Name *</label>
            <input v-model="sectionForm.name" type="text" required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
            <input v-model="sectionForm.room_number" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input v-model.number="sectionForm.capacity" type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Floor Number</label>
            <input v-model.number="sectionForm.floor_number" type="number"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Building Name</label>
            <input v-model="sectionForm.building_name" type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
          </div>
          <div class="flex justify-end gap-2 pt-4">
            <button type="button" @click="closeSectionModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              {{ isSectionEditMode ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import apiClient from '@/api/client'

const classes = ref<any[]>([])
const sections = ref<any[]>([])
const selectedClass = ref<any>(null)

const showClassModal = ref(false)
const showSectionsModal = ref(false)
const showSectionModal = ref(false)
const isEditMode = ref(false)
const isSectionEditMode = ref(false)

const classForm = ref({
  id: '',
  name: '',
  display_name: '',
  level: 'primary',
  sequence_order: 1,
  wing: '',
  capacity: null,
  description: ''
})

const sectionForm = ref({
  id: '',
  class_id: '',
  name: '',
  room_number: '',
  capacity: null,
  floor_number: null,
  building_name: ''
})

onMounted(() => {
  loadClasses()
})

async function loadClasses() {
  try {
    const response = await apiClient.get('/academics/classes')
    classes.value = response.data
  } catch (error) {
    console.error('Failed to load classes:', error)
  }
}

async function loadSections(classId: string) {
  try {
    const response = await apiClient.get(`/academics/classes/${classId}/sections`)
    sections.value = response.data
  } catch (error) {
    console.error('Failed to load sections:', error)
  }
}

function openAddClassModal() {
  isEditMode.value = false
  classForm.value = {
    id: '',
    name: '',
    display_name: '',
    level: 'primary',
    sequence_order: classes.value.length + 1,
    wing: '',
    capacity: null,
    description: ''
  }
  showClassModal.value = true
}

function editClass(cls: any) {
  isEditMode.value = true
  classForm.value = { ...cls }
  showClassModal.value = true
}

function closeClassModal() {
  showClassModal.value = false
}

async function saveClass() {
  try {
    if (isEditMode.value) {
      await apiClient.put(`/academics/classes/${classForm.value.id}`, classForm.value)
    } else {
      await apiClient.post('/academics/classes', classForm.value)
    }
    await loadClasses()
    closeClassModal()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to save class')
  }
}

async function deleteClass(cls: any) {
  if (!confirm(`Delete class ${cls.display_name}? This cannot be undone.`)) return

  try {
    await apiClient.delete(`/academics/classes/${cls.id}`)
    await loadClasses()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete class')
  }
}

async function viewSections(cls: any) {
  selectedClass.value = cls
  await loadSections(cls.id)
  showSectionsModal.value = true
}

function closeSectionsModal() {
  showSectionsModal.value = false
  selectedClass.value = null
}

function openAddSectionModal() {
  isSectionEditMode.value = false
  sectionForm.value = {
    id: '',
    class_id: selectedClass.value.id,
    name: '',
    room_number: '',
    capacity: null,
    floor_number: null,
    building_name: ''
  }
  showSectionModal.value = true
}

function editSection(section: any) {
  isSectionEditMode.value = true
  sectionForm.value = { ...section }
  showSectionModal.value = true
}

function closeSectionModal() {
  showSectionModal.value = false
}

async function saveSection() {
  try {
    if (isSectionEditMode.value) {
      await apiClient.put(`/academics/sections/${sectionForm.value.id}`, sectionForm.value)
    } else {
      await apiClient.post('/academics/sections', sectionForm.value)
    }
    await loadSections(selectedClass.value.id)
    closeSectionModal()
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to save section')
  }
}

async function deleteSection(section: any) {
  if (!confirm(`Delete section ${section.name}? This cannot be undone.`)) return

  try {
    await apiClient.delete(`/academics/sections/${section.id}`)
    await loadSections(selectedClass.value.id)
  } catch (error: any) {
    alert(error.response?.data?.message || 'Failed to delete section')
  }
}
</script>

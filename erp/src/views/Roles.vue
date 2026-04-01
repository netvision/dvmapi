<template>
  <div class="space-y-5">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Role Management</h1>
        <p class="page-subtitle">{{ roles.length }} roles configured</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <Plus :size="15" />
        Add Role
      </button>
    </div>

    <!-- Roles table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Role Name</th>
              <th>Display Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td>
                <code class="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-mono">{{ role.name }}</code>
              </td>
              <td class="font-medium text-slate-800">{{ role.display_name }}</td>
              <td class="text-slate-500 text-sm">{{ role.description || '—' }}</td>
              <td>
                <span v-if="role.is_system" class="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">System</span>
                <span v-else class="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">Custom</span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <button @click="openEditModal(role)" class="icon-btn text-slate-500 hover:text-blue-600" title="Edit">
                    <Pencil :size="14" />
                  </button>
                  <button
                    v-if="!role.is_system"
                    @click="confirmDelete(role)"
                    class="icon-btn text-slate-500 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="roles.length === 0">
              <td colspan="5" class="text-center text-slate-400 py-8">No roles found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-box">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-base font-semibold text-slate-800">{{ editingRole ? 'Edit Role' : 'Add New Role' }}</h2>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600"><X :size="18" /></button>
        </div>

        <form @submit.prevent="saveRole" class="space-y-4">
          <div v-if="!editingRole">
            <label class="form-label">Role Name <span class="text-slate-400 text-xs">(used in code, e.g. class_teacher)</span></label>
            <input v-model="formData.name" type="text" class="form-input" placeholder="e.g. vice_principal" required />
            <p class="text-xs text-slate-400 mt-1">Lowercase letters, numbers, and underscores only. Cannot be changed later.</p>
          </div>
          <div>
            <label class="form-label">Display Name</label>
            <input v-model="formData.display_name" type="text" class="form-input" placeholder="e.g. Vice Principal" required />
          </div>
          <div>
            <label class="form-label">Description <span class="text-slate-400 text-xs">(optional)</span></label>
            <input v-model="formData.description" type="text" class="form-input" placeholder="Brief description of this role" />
          </div>

          <div v-if="formError" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{{ formError }}</div>

          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary flex-1 justify-center" :disabled="saving">
              {{ saving ? 'Saving…' : (editingRole ? 'Update Role' : 'Create Role') }}
            </button>
            <button type="button" class="btn-secondary" @click="closeModal">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal-box max-w-sm">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 :size="16" class="text-red-600" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-slate-800">Delete Role</h2>
            <p class="text-sm text-slate-500">This action cannot be undone.</p>
          </div>
        </div>
        <p class="text-sm text-slate-600 mb-5">
          Are you sure you want to delete the <strong>{{ deletingRole?.display_name }}</strong> role?
          Make sure no users are assigned to it first.
        </p>
        <div v-if="deleteError" class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded mb-4">{{ deleteError }}</div>
        <div class="flex gap-3">
          <button @click="deleteRole" class="btn-danger flex-1 justify-center" :disabled="saving">
            {{ saving ? 'Deleting…' : 'Delete' }}
          </button>
          <button @click="showDeleteModal = false" class="btn-secondary flex-1 justify-center">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Pencil, Trash2, X } from 'lucide-vue-next'
import { apiClient } from '../api/client'

interface Role {
  id: string
  name: string
  display_name: string
  description: string | null
  is_system: boolean
  created_at: string
}

const roles = ref<Role[]>([])
const showModal = ref(false)
const editingRole = ref<Role | null>(null)
const showDeleteModal = ref(false)
const deletingRole = ref<Role | null>(null)
const saving = ref(false)
const formError = ref('')
const deleteError = ref('')

const formData = ref({ name: '', display_name: '', description: '' })

onMounted(loadRoles)

async function loadRoles() {
  const res = await apiClient.get('/core/roles')
  roles.value = res.data.data
}

function openCreateModal() {
  editingRole.value = null
  formData.value = { name: '', display_name: '', description: '' }
  formError.value = ''
  showModal.value = true
}

function openEditModal(role: Role) {
  editingRole.value = role
  formData.value = { name: role.name, display_name: role.display_name, description: role.description || '' }
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingRole.value = null
}

async function saveRole() {
  saving.value = true
  formError.value = ''
  try {
    if (editingRole.value) {
      await apiClient.put(`/core/roles/${editingRole.value.id}`, {
        display_name: formData.value.display_name,
        description: formData.value.description || null,
      })
    } else {
      await apiClient.post('/core/roles', {
        name: formData.value.name,
        display_name: formData.value.display_name,
        description: formData.value.description || null,
      })
    }
    await loadRoles()
    closeModal()
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Failed to save role'
  } finally {
    saving.value = false
  }
}

function confirmDelete(role: Role) {
  deletingRole.value = role
  deleteError.value = ''
  showDeleteModal.value = true
}

async function deleteRole() {
  if (!deletingRole.value) return
  saving.value = true
  deleteError.value = ''
  try {
    await apiClient.delete(`/core/roles/${deletingRole.value.id}`)
    await loadRoles()
    showDeleteModal.value = false
    deletingRole.value = null
  } catch (err: any) {
    deleteError.value = err.response?.data?.message || 'Failed to delete role'
  } finally {
    saving.value = false
  }
}
</script>

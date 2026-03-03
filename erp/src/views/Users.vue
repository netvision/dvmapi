<template>
  <div class="space-y-5">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Users</h1>
        <p class="page-subtitle">{{ pagination.total }} total accounts</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        <Plus :size="15" />
        Add User
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-4">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-48">
          <Search :size="14" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search usersâ€¦"
            class="form-input pl-8"
            @input="handleSearch"
          />
        </div>
        <select v-model="roleFilter" class="form-input w-40" @change="loadUsers">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
          <option value="staff">Staff</option>
          <option value="user">Viewer</option>
          <option value="librarian">Librarian</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {{ (user.first_name?.[0] || user.email[0]).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-medium text-slate-900">{{ user.first_name || '' }} {{ user.last_name || '' }}</p>
                    <p class="text-xs text-slate-400">{{ user.email }}</p>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" :class="getRoleClass(user.role)">{{ user.role }}</span>
              </td>
              <td>
                <span class="badge" :class="user.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-500'">
                  {{ user.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button @click="openEditModal(user)" class="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Edit">
                    <Pencil :size="14" />
                  </button>
                  <button @click="openPasswordModal(user)" class="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Reset password">
                    <KeyRound :size="14" />
                  </button>
                  <button @click="toggleStatus(user)" class="p-1.5 rounded-md text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors" :title="user.is_active ? 'Suspend' : 'Activate'">
                    <component :is="user.is_active ? ShieldOff : ShieldCheck" :size="14" />
                  </button>
                  <button @click="handleDelete(user)" class="p-1.5 rounded-md text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
        <p class="text-xs text-slate-500">
          {{ (pagination.page - 1) * pagination.limit + 1 }}â€“{{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
        </p>
        <div class="flex items-center gap-2">
          <button @click="changePage(pagination.page - 1)" :disabled="pagination.page === 1" class="btn-secondary py-1.5 px-3 disabled:opacity-40">
            <ChevronLeft :size="14" />
          </button>
          <span class="text-xs text-slate-500">{{ pagination.page }} / {{ pagination.totalPages }}</span>
          <button @click="changePage(pagination.page + 1)" :disabled="pagination.page >= pagination.totalPages" class="btn-secondary py-1.5 px-3 disabled:opacity-40">
            <ChevronRight :size="14" />
          </button>
        </div>
      </div>
    </div>

    <!-- â”€â”€ Password Reset Modal â”€â”€ -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Reset Password</h3>
          <button @click="closePasswordModal" class="text-slate-400 hover:text-slate-600 transition-colors">
            <X :size="18" />
          </button>
        </div>
        <form @submit.prevent="handlePasswordReset" class="p-6 space-y-4">
          <p class="text-sm text-slate-500">Setting a new password for <span class="font-medium text-slate-700">{{ passwordResetUser?.email }}</span>.</p>
          <div>
            <label class="form-label">New Password</label>
            <input v-model="newPassword" type="password" required minlength="6" class="form-input" placeholder="Minimum 6 characters" />
          </div>
          <div>
            <label class="form-label">Confirm Password</label>
            <input v-model="confirmPassword" type="password" required class="form-input" placeholder="Re-enter password" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary flex-1 justify-center">Reset Password</button>
            <button type="button" @click="closePasswordModal" class="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- â”€â”€ User Create/Edit Modal â”€â”€ -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">{{ editingUser ? 'Edit User' : 'Create User' }}</h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 transition-colors">
            <X :size="18" />
          </button>
        </div>
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div>
            <label class="form-label">Email</label>
            <input v-model="formData.email" type="email" required :disabled="!!editingUser" class="form-input" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">First Name</label>
              <input v-model="formData.first_name" type="text" class="form-input" />
            </div>
            <div>
              <label class="form-label">Last Name</label>
              <input v-model="formData.last_name" type="text" class="form-input" />
            </div>
          </div>
          <div v-if="!editingUser">
            <label class="form-label">Password</label>
            <input v-model="formData.password" type="password" required class="form-input" />
          </div>
          <div>
            <label class="form-label">Role</label>
            <select v-model="formData.role" class="form-input">
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="staff">Staff</option>
              <option value="user">Viewer</option>
              <option value="librarian">Librarian</option>
            </select>
          </div>
          <div v-if="editingUser" class="flex items-center gap-2">
            <input v-model="formData.is_active" type="checkbox" id="is_active" class="w-4 h-4 rounded border-slate-300 text-blue-600" />
            <label for="is_active" class="text-sm text-slate-700">Active account</label>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="submit" class="btn-primary flex-1 justify-center">{{ editingUser ? 'Update' : 'Create' }}</button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1 justify-center">Cancel</button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Search, Pencil, KeyRound, ShieldOff, ShieldCheck, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'
import userService from '../services/user.service'
import type { User } from '../services/auth.service'

const getRoleClass = (role: string) => {
  const classes: Record<string, string> = {
    admin: 'bg-blue-50 text-blue-700',
    teacher: 'bg-emerald-50 text-emerald-700',
    student: 'bg-violet-50 text-violet-700',
    parent: 'bg-pink-50 text-pink-700',
    staff: 'bg-orange-50 text-orange-700',
    user: 'bg-slate-100 text-slate-600',
    librarian: 'bg-teal-50 text-teal-700',
  }
  return classes[role] || 'bg-slate-100 text-slate-600'
}

const users = ref<User[]>([])
const pagination = ref({ page: 1, limit: 10, total: 0, totalPages: 0 })
const searchQuery = ref('')
const roleFilter = ref('')
const showModal = ref(false)
const editingUser = ref<User | null>(null)
const formData = ref({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'student' as 'admin' | 'teacher' | 'student' | 'parent' | 'staff' | 'user' | 'librarian',
  is_active: true
})

// Password reset modal
const showPasswordModal = ref(false)
const passwordResetUser = ref<User | null>(null)
const newPassword = ref('')
const confirmPassword = ref('')

onMounted(() => {
  loadUsers()
})

const loadUsers = async () => {
  try {
    const response = await userService.getUsers({
      page: pagination.value.page,
      limit: pagination.value.limit,
      role: roleFilter.value || undefined,
      search: searchQuery.value || undefined
    })
    users.value = response.data
    pagination.value = response.pagination
  } catch (error) {
    console.error('Failed to load users:', error)
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  loadUsers()
}

const changePage = (page: number) => {
  pagination.value.page = page
  loadUsers()
}

const openCreateModal = () => {
  editingUser.value = null
  formData.value = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'student',
    is_active: true
  }
  showModal.value = true
}

const openEditModal = (user: User) => {
  editingUser.value = user
  formData.value = {
    email: user.email,
    password: '',
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    role: user.role,
    is_active: user.is_active
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingUser.value = null
}

const handleSubmit = async () => {
  try {
    if (editingUser.value) {
      await userService.updateUser(editingUser.value.id, {
        email: formData.value.email,
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        role: formData.value.role,
        is_active: formData.value.is_active
      })
    } else {
      await userService.createUser(formData.value)
    }
    closeModal()
    loadUsers()
  } catch (error) {
    console.error('Failed to save user:', error)
    alert('Failed to save user')
  }
}

const handleDelete = async (user: User) => {
  if (!confirm(`Are you sure you want to delete ${user.email}?`)) return
  
  try {
    await userService.deleteUser(user.id)
    loadUsers()
  } catch (error) {
    console.error('Failed to delete user:', error)
    alert('Failed to delete user')
  }
}

const openPasswordModal = (user: User) => {
  passwordResetUser.value = user
  newPassword.value = ''
  confirmPassword.value = ''
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordResetUser.value = null
  newPassword.value = ''
  confirmPassword.value = ''
}

const handlePasswordReset = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('Passwords do not match!')
    return
  }

  if (newPassword.value.length < 6) {
    alert('Password must be at least 6 characters long')
    return
  }

  if (!passwordResetUser.value) return

  try {
    await userService.resetUserPassword(passwordResetUser.value.id, newPassword.value)
    alert('Password reset successfully!')
    closePasswordModal()
  } catch (error) {
    console.error('Failed to reset password:', error)
    alert('Failed to reset password')
  }
}

const toggleStatus = async (user: User) => {
  const action = user.is_active ? 'suspend' : 'activate'
  if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) return

  try {
    await userService.toggleUserStatus(user.id)
    loadUsers()
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    alert('Failed to toggle user status')
  }
}
</script>

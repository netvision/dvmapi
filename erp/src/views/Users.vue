<template>
  <div>
    <!-- Header Actions -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search users..."
          class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          @input="handleSearch"
        />
        <select
          v-model="roleFilter"
          class="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
          @change="loadUsers"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
          <option value="parent">Parent</option>
          <option value="staff">Staff</option>
        </select>
      </div>
      
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
      >
        + Add User
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.first_name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ user.last_name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ user.role }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openEditModal(user)" class="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
              <button @click="openPasswordModal(user)" class="text-blue-600 hover:text-blue-900 mr-3">Reset Password</button>
              <button @click="toggleStatus(user)" class="text-yellow-600 hover:text-yellow-900 mr-3">
                {{ user.is_active ? 'Suspend' : 'Activate' }}
              </button>
              <button @click="handleDelete(user)" class="text-red-600 hover:text-red-900">Delete</button>
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

    <!-- Password Reset Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">Reset Password</h3>
        <p class="text-gray-600 mb-4">Reset password for: <strong>{{ passwordResetUser?.email }}</strong></p>
        
        <form @submit.prevent="handlePasswordReset">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              required
              minlength="6"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
              placeholder="Minimum 6 characters"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
              placeholder="Re-enter password"
            />
          </div>
          
          <div class="flex gap-4">
            <button
              type="submit"
              class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Reset Password
            </button>
            <button
              type="button"
              @click="closePasswordModal"
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">{{ editingUser ? 'Edit User' : 'Create User' }}</h3>
        
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              v-model="formData.email"
              type="email"
              required
              :disabled="!!editingUser"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">First Name</label>
            <input
              v-model="formData.first_name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
            <input
              v-model="formData.last_name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div v-if="!editingUser" class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              v-model="formData.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2">Role</label>
            <select
              v-model="formData.role"
              class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500"
            >
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          
          <div v-if="editingUser" class="mb-4">
            <label class="flex items-center">
              <input v-model="formData.is_active" type="checkbox" class="mr-2" />
              <span class="text-gray-700 text-sm font-bold">Active</span>
            </label>
          </div>
          
          <div class="flex gap-4">
            <button
              type="submit"
              class="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 transition-colors"
            >
              {{ editingUser ? 'Update' : 'Create' }}
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
import userService from '../services/user.service'
import type { User } from '../services/auth.service'

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
  role: 'student' as 'admin' | 'teacher' | 'student' | 'parent' | 'staff',
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

import apiClient from '../api/client'
import type { User } from './auth.service'

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface SingleResponse<T> {
  success: boolean
  data: T
}

class UserService {
  async getUsers(params?: {
    page?: number
    limit?: number
    role?: string
    search?: string
  }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get('/core/users', { params })
    return response.data
  }

  async getUserById(id: number): Promise<SingleResponse<User>> {
    const response = await apiClient.get(`/core/users/${id}`)
    return response.data
  }

  async createUser(data: {
    email: string
    password: string
    first_name?: string
    last_name?: string
    role?: 'admin' | 'teacher' | 'student' | 'parent' | 'staff'
  }): Promise<SingleResponse<User>> {
    const response = await apiClient.post('/core/users', data)
    return response.data
  }

  async updateUser(id: number, data: Partial<{
    email: string
    first_name: string
    last_name: string
    role: 'admin' | 'teacher' | 'student' | 'parent' | 'staff'
    is_active: boolean
  }>): Promise<SingleResponse<User>> {
    const response = await apiClient.put(`/core/users/${id}`, data)
    return response.data
  }

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/core/users/${id}`)
    return response.data
  }

  async resetUserPassword(id: number, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/core/users/${id}/reset-password`, { newPassword })
    return response.data
  }

  async toggleUserStatus(id: number): Promise<SingleResponse<User>> {
    const response = await apiClient.patch(`/core/users/${id}/toggle-status`)
    return response.data
  }
}

export default new UserService()

import { apiClient } from '../api/client'

export interface ContactMessage {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

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

class ContactService {
  async getMessages(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<PaginatedResponse<ContactMessage>> {
    const response = await apiClient.get('/cms/contact', { params })
    return response.data
  }

  async getMessage(id: number): Promise<SingleResponse<ContactMessage>> {
    const response = await apiClient.get(`/cms/contact/${id}`)
    return response.data
  }

  async updateStatus(id: number, status: ContactMessage['status']): Promise<SingleResponse<ContactMessage>> {
    const response = await apiClient.patch(`/cms/contact/${id}/status`, { status })
    return response.data
  }

  async deleteMessage(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/cms/contact/${id}`)
    return response.data
  }
}

export const useContactService = () => new ContactService()
export default new ContactService()

import apiClient from '../api/client'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'staff'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name?: string
  last_name?: string
  role?: 'admin' | 'teacher' | 'student' | 'parent' | 'staff'
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export interface UserResponse {
  success: boolean
  data: User
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/core/auth/login', credentials)
    return response.data
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/core/auth/register', data)
    return response.data
  }

  async getProfile(): Promise<UserResponse> {
    const response = await apiClient.get('/core/auth/profile')
    return response.data
  }

  async refresh(refreshToken: string): Promise<{ success: boolean; data: { accessToken: string } }> {
    const response = await apiClient.post('/core/auth/refresh', { refreshToken })
    return response.data
  }

  logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }
}

export default new AuthService()

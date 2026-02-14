import { apiClient } from '../api/client'

export interface Student {
  id: string
  admission_number: string
  roll_number?: string
  first_name: string
  middle_name?: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  blood_group?: string
  nationality?: string
  religion?: string
  category?: 'general' | 'obc' | 'sc' | 'st' | 'other'
  aadhar_number?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  class: string
  section?: string
  academic_year: string
  admission_date: string
  status: 'active' | 'inactive' | 'alumni' | 'transferred'
  parent1_name: string
  parent1_relation: string
  parent1_phone: string
  parent1_email?: string
  parent1_occupation?: string
  parent1_annual_income?: number
  parent2_name?: string
  parent2_relation?: string
  parent2_phone?: string
  parent2_email?: string
  parent2_occupation?: string
  parent2_annual_income?: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  photo_url?: string
  medical_conditions?: string
  allergies?: string
  previous_school?: string
  previous_school_name?: string
  father_email?: string
  father_qualification?: string
  father_profession?: string
  father_designation?: string
  father_annual_income?: number
  mother_email?: string
  mother_qualification?: string
  mother_profession?: string
  mother_designation?: string
  mother_annual_income?: number
  transfer_certificate_number?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface StudentFilters {
  page?: number
  limit?: number
  class?: string
  section?: string
  status?: string
  academic_year?: string
  search?: string
}

export interface StudentStatistics {
  overview: {
    active_students: number
    inactive_students: number
    male_students: number
    female_students: number
    total_classes: number
    academic_years: number
  }
  classSummary: {
    class: string
    section: string
    student_count: number
    male_count: number
    female_count: number
  }[]
}

export interface StudentDashboard {
  profile: {
    id: string
    admission_number: string
    first_name: string
    last_name: string
    class: string
    section?: string
    academic_year: string
    status: string
  }
  attendance: {
    present_days: number
    absent_days: number
    late_days: number
    total_marked_days: number
  }
  results: {
    exams_attempted: number
    average_percentage: number
  }
}

export interface AttendanceRecordInput {
  student_id: string
  status: 'present' | 'absent' | 'late' | 'half-day' | 'leave' | 'holiday'
  remarks?: string
}

export interface ExamResult {
  id: string
  student_id: string
  examination_id: string
  examination_name: string
  subject: string
  marks_obtained: number
  total_marks: number
  grade?: string
  remarks?: string
  exam_date?: string
  admission_number?: string
  first_name?: string
  last_name?: string
  class?: string
  section?: string
  academic_year?: string
}

const studentService = {
  async getAll(filters?: StudentFilters) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const response = await apiClient.get(`/students?${params.toString()}`)
    return response.data
  },

  async getById(id: string) {
    const response = await apiClient.get(`/students/${id}`)
    return response.data
  },

  async getByAdmissionNumber(admissionNumber: string) {
    const response = await apiClient.get(`/students/admission/${admissionNumber}`)
    return response.data
  },

  async create(data: Partial<Student>) {
    const response = await apiClient.post('/students', data)
    return response.data
  },

  async update(id: string, data: Partial<Student>) {
    const response = await apiClient.put(`/students/${id}`, data)
    return response.data
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/students/${id}`)
    return response.data
  },

  async permanentDelete(id: string) {
    const response = await apiClient.delete(`/students/${id}/permanent`)
    return response.data
  },

  async getStatistics(academicYear?: string) {
    const params = academicYear ? `?academic_year=${academicYear}` : ''
    const response = await apiClient.get(`/students/statistics${params}`)
    return response.data
  },

  async getMyDashboard() {
    const response = await apiClient.get('/students/me/dashboard')
    return response.data as { success: boolean; data: StudentDashboard }
  },

  async getAttendanceByClassDate(payload: { attendance_date: string; class: string; section?: string }) {
    const params = new URLSearchParams()
    params.append('attendance_date', payload.attendance_date)
    params.append('class', payload.class)
    if (payload.section) {
      params.append('section', payload.section)
    }

    const response = await apiClient.get(`/students/attendance?${params.toString()}`)
    return response.data
  },

  async markAttendance(payload: { attendance_date: string; class: string; section?: string; records: AttendanceRecordInput[] }) {
    const response = await apiClient.post('/students/attendance/mark', payload)
    return response.data
  },

  async getExamResults(filters?: {
    student_id?: string
    examination_id?: string
    class?: string
    section?: string
    academic_year?: string
    limit?: number
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }

    const query = params.toString()
    const response = await apiClient.get(`/students/exam-results${query ? `?${query}` : ''}`)
    return response.data as { success: boolean; data: ExamResult[] }
  },

  async upsertExamResult(payload: {
    student_id?: string
    admission_number?: string
    examination_id: string
    examination_name: string
    subject: string
    marks_obtained: number
    total_marks: number
    grade?: string
    remarks?: string
    exam_date?: string
  }) {
    const response = await apiClient.post('/students/exam-results', payload)
    return response.data as { success: boolean; data: ExamResult }
  }
}

export default studentService

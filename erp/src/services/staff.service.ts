import { apiClient } from '../api/client';

export interface Staff {
  id: string;
  employee_id: string;
  user_id?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  nationality: string;
  religion?: string;
  category?: string;
  marital_status?: string;
  email: string;
  phone: string;
  alternate_phone?: string;
  aadhar_number?: string;
  pan_number?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  staff_type: 'teaching' | 'non-teaching' | 'administrative' | 'support';
  designation: string;
  department?: string;
  date_of_joining: string;
  employment_type: 'permanent' | 'contract' | 'temporary' | 'part-time';
  status: 'active' | 'on-leave' | 'suspended' | 'resigned' | 'retired';
  highest_qualification?: string;
  qualifications?: any[];
  specialization?: string;
  experience_years?: number;
  previous_experience?: string;
  basic_salary?: number;
  gross_salary?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_ifsc?: string;
  pf_number?: string;
  esi_number?: string;
  photo_url?: string;
  resume_url?: string;
  documents?: any[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  medical_conditions?: string;
  allergies?: string;
  subjects_can_teach?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffQuery {
  page?: number;
  limit?: number;
  search?: string;
  staff_type?: string;
  department?: string;
  designation?: string;
  status?: string;
  employment_type?: string;
}

export const staffService = {
  async getAll(params: StaffQuery = {}) {
    const response = await apiClient.get('/staff', { params });
    return response.data;
  },

  async getById(id: string) {
    const response = await apiClient.get(`/staff/${id}`);
    return response.data;
  },

  async getByEmployeeId(employee_id: string) {
    const response = await apiClient.get(`/staff/employee/${employee_id}`);
    return response.data;
  },

  async create(data: Partial<Staff>) {
    const response = await apiClient.post('/staff', data);
    return response.data;
  },

  async update(id: string, data: Partial<Staff>) {
    const response = await apiClient.put(`/staff/${id}`, data);
    return response.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/staff/${id}`);
    return response.data;
  },

  async getStatistics() {
    const response = await apiClient.get('/staff/statistics');
    return response.data;
  },

  async getLeaveBalance(id: string, academicYearId?: string) {
    const params = academicYearId ? { academic_year_id: academicYearId } : {};
    const response = await apiClient.get(`/staff/${id}/leave-balance`, { params });
    return response.data;
  },

  async getLeaves(id: string, status?: string, year?: string) {
    const params: any = {};
    if (status) params.status = status;
    if (year) params.year = year;
    const response = await apiClient.get(`/staff/${id}/leaves`, { params });
    return response.data;
  }
};

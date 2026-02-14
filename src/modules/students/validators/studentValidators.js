import Joi from 'joi';

export const studentSchemas = {
  create: Joi.object({
    // Required fields
    admission_number: Joi.string().required().max(50).trim(),
    first_name: Joi.string().required().max(100).trim(),
    last_name: Joi.string().required().max(100).trim(),
    date_of_birth: Joi.date().iso().max('now').required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    class: Joi.string().required().max(50).trim(),
    academic_year: Joi.string().required().max(20).trim(),
    admission_date: Joi.date().iso().required(),
    
    // Parent 1 (required)
    parent1_name: Joi.string().required().max(200).trim(),
    parent1_relation: Joi.string().required().max(50).trim(),
    parent1_phone: Joi.string().required().max(20).trim(),
    
    // Optional fields
    roll_number: Joi.string().allow('', null).max(50).trim(),
    middle_name: Joi.string().allow('', null).max(100).trim(),
    blood_group: Joi.string().allow('', null).max(10).trim(),
    nationality: Joi.string().allow('', null).max(100).trim().default('Indian'),
    religion: Joi.string().allow('', null).max(50).trim(),
    category: Joi.string().valid('general', 'obc', 'sc', 'st', 'other').allow('', null),
    aadhar_number: Joi.string().allow('', null).length(12).pattern(/^\d+$/),
    
    // Contact
    email: Joi.string().email().allow('', null).max(255),
    phone: Joi.string().allow('', null).max(20).trim(),
    address: Joi.string().allow('', null).max(500).trim(),
    city: Joi.string().allow('', null).max(100).trim(),
    state: Joi.string().allow('', null).max(100).trim(),
    pincode: Joi.string().allow('', null).max(10).trim(),
    
    // Academic
    section: Joi.string().allow('', null).max(10).trim(),
    status: Joi.string().valid('active', 'inactive', 'alumni', 'transferred').default('active'),
    
    // Parent 1 optional
    parent1_email: Joi.string().email().allow('', null).max(255),
    parent1_occupation: Joi.string().allow('', null).max(100).trim(),
    parent1_annual_income: Joi.number().allow(null).min(0),
    
    // Parent 2 (all optional)
    parent2_name: Joi.string().allow('', null).max(200).trim(),
    parent2_relation: Joi.string().allow('', null).max(50).trim(),
    parent2_phone: Joi.string().allow('', null).max(20).trim(),
    parent2_email: Joi.string().email().allow('', null).max(255),
    parent2_occupation: Joi.string().allow('', null).max(100).trim(),
    parent2_annual_income: Joi.number().allow(null).min(0),
    
    // Emergency contact
    emergency_contact_name: Joi.string().allow('', null).max(200).trim(),
    emergency_contact_phone: Joi.string().allow('', null).max(20).trim(),
    emergency_contact_relation: Joi.string().allow('', null).max(50).trim(),
    
    // Additional
    photo_url: Joi.string().uri().allow('', null).max(500),
    medical_conditions: Joi.string().allow('', null).max(1000).trim(),
    allergies: Joi.string().allow('', null).max(1000).trim(),
    previous_school: Joi.string().allow('', null).max(255).trim(),
    transfer_certificate_number: Joi.string().allow('', null).max(100).trim(),
    notes: Joi.string().allow('', null).max(2000).trim()
  }),

  update: Joi.object({
    // All fields optional for update
    admission_number: Joi.string().max(50).trim(),
    roll_number: Joi.string().allow('', null).max(50).trim(),
    first_name: Joi.string().max(100).trim(),
    middle_name: Joi.string().allow('', null).max(100).trim(),
    last_name: Joi.string().max(100).trim(),
    date_of_birth: Joi.date().iso().max('now'),
    gender: Joi.string().valid('male', 'female', 'other'),
    blood_group: Joi.string().allow('', null).max(10).trim(),
    nationality: Joi.string().allow('', null).max(100).trim(),
    religion: Joi.string().allow('', null).max(50).trim(),
    category: Joi.string().valid('general', 'obc', 'sc', 'st', 'other').allow('', null),
    aadhar_number: Joi.string().allow('', null).length(12).pattern(/^\d+$/),
    
    email: Joi.string().email().allow('', null).max(255),
    phone: Joi.string().allow('', null).max(20).trim(),
    address: Joi.string().allow('', null).max(500).trim(),
    city: Joi.string().allow('', null).max(100).trim(),
    state: Joi.string().allow('', null).max(100).trim(),
    pincode: Joi.string().allow('', null).max(10).trim(),
    
    class: Joi.string().max(50).trim(),
    section: Joi.string().allow('', null).max(10).trim(),
    academic_year: Joi.string().max(20).trim(),
    admission_date: Joi.date().iso(),
    status: Joi.string().valid('active', 'inactive', 'alumni', 'transferred'),
    
    parent1_name: Joi.string().max(200).trim(),
    parent1_relation: Joi.string().max(50).trim(),
    parent1_phone: Joi.string().max(20).trim(),
    parent1_email: Joi.string().email().allow('', null).max(255),
    parent1_occupation: Joi.string().allow('', null).max(100).trim(),
    parent1_annual_income: Joi.number().allow(null).min(0),
    
    parent2_name: Joi.string().allow('', null).max(200).trim(),
    parent2_relation: Joi.string().allow('', null).max(50).trim(),
    parent2_phone: Joi.string().allow('', null).max(20).trim(),
    parent2_email: Joi.string().email().allow('', null).max(255),
    parent2_occupation: Joi.string().allow('', null).max(100).trim(),
    parent2_annual_income: Joi.number().allow(null).min(0),
    
    emergency_contact_name: Joi.string().allow('', null).max(200).trim(),
    emergency_contact_phone: Joi.string().allow('', null).max(20).trim(),
    emergency_contact_relation: Joi.string().allow('', null).max(50).trim(),
    
    photo_url: Joi.string().uri().allow('', null).max(500),
    medical_conditions: Joi.string().allow('', null).max(1000).trim(),
    allergies: Joi.string().allow('', null).max(1000).trim(),
    previous_school: Joi.string().allow('', null).max(255).trim(),
    transfer_certificate_number: Joi.string().allow('', null).max(100).trim(),
    notes: Joi.string().allow('', null).max(2000).trim()
  }).min(1),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    class: Joi.string().max(50).trim(),
    section: Joi.string().max(10).trim(),
    status: Joi.string().valid('active', 'inactive', 'alumni', 'transferred'),
    academic_year: Joi.string().max(20).trim(),
    search: Joi.string().max(100).trim()
  }),

  markAttendance: Joi.object({
    attendance_date: Joi.date().iso().required(),
    class: Joi.string().required().max(50).trim(),
    section: Joi.string().allow('', null).max(10).trim(),
    records: Joi.array().items(
      Joi.object({
        student_id: Joi.string().uuid().required(),
        status: Joi.string().valid('present', 'absent', 'late', 'half-day', 'leave', 'holiday').required(),
        remarks: Joi.string().allow('', null).max(500).trim()
      })
    ).min(1).required()
  }),

  attendanceQuery: Joi.object({
    attendance_date: Joi.date().iso().required(),
    class: Joi.string().required().max(50).trim(),
    section: Joi.string().allow('', null).max(10).trim()
  }),

  upsertExamResult: Joi.object({
    student_id: Joi.string().uuid().required(),
    examination_id: Joi.string().required().max(100).trim(),
    examination_name: Joi.string().required().max(255).trim(),
    subject: Joi.string().required().max(100).trim(),
    marks_obtained: Joi.number().required().min(0),
    total_marks: Joi.number().required().greater(0),
    grade: Joi.string().allow('', null).max(10).trim(),
    remarks: Joi.string().allow('', null).max(1000).trim(),
    exam_date: Joi.date().iso().allow(null)
  }),

  examResultsQuery: Joi.object({
    student_id: Joi.string().uuid().optional(),
    examination_id: Joi.string().max(100).trim().optional(),
    class: Joi.string().max(50).trim().optional(),
    section: Joi.string().allow('', null).max(10).trim().optional(),
    academic_year: Joi.string().max(20).trim().optional(),
    limit: Joi.number().integer().min(1).max(500).default(100)
  })
};

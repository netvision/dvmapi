-- Students Module - Database Schema
-- Migration: 002-create-students-table.sql

-- ============================================================================
-- STUDENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Student Identification
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    roll_number VARCHAR(50),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
    blood_group VARCHAR(10),
    nationality VARCHAR(100) DEFAULT 'Indian',
    religion VARCHAR(50),
    category VARCHAR(50) CHECK (category IN ('general', 'obc', 'sc', 'st', 'other')),
    aadhar_number VARCHAR(12),
    
    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Academic Information
    class VARCHAR(50) NOT NULL,
    section VARCHAR(10),
    academic_year VARCHAR(20) NOT NULL,
    admission_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'alumni', 'transferred')),
    
    -- Parent/Guardian 1 Information
    parent1_name VARCHAR(200) NOT NULL,
    parent1_relation VARCHAR(50) NOT NULL,
    parent1_phone VARCHAR(20) NOT NULL,
    parent1_email VARCHAR(255),
    parent1_occupation VARCHAR(100),
    parent1_annual_income DECIMAL(12, 2),
    
    -- Parent/Guardian 2 Information (Optional)
    parent2_name VARCHAR(200),
    parent2_relation VARCHAR(50),
    parent2_phone VARCHAR(20),
    parent2_email VARCHAR(255),
    parent2_occupation VARCHAR(100),
    parent2_annual_income DECIMAL(12, 2),
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    -- Additional Information
    photo_url TEXT,
    medical_conditions TEXT,
    allergies TEXT,
    previous_school VARCHAR(255),
    transfer_certificate_number VARCHAR(100),
    notes TEXT,
    
    -- User Account Reference (Optional - links to users table for student portal access)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_students_admission_number ON students(admission_number);
CREATE INDEX IF NOT EXISTS idx_students_class_section ON students(class, section);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_academic_year ON students(academic_year);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_students_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_students_updated_at();

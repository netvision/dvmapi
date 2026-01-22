-- Create staff table
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
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
    marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
    
    -- Contact Information
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    aadhar_number VARCHAR(12),
    pan_number VARCHAR(10),
    
    -- Address
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    
    -- Employment Details
    staff_type VARCHAR(50) NOT NULL CHECK (staff_type IN ('teaching', 'non-teaching', 'administrative', 'support')),
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    date_of_joining DATE NOT NULL,
    employment_type VARCHAR(50) CHECK (employment_type IN ('permanent', 'contract', 'temporary', 'part-time')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'on-leave', 'suspended', 'resigned', 'retired')),
    
    -- Qualifications
    highest_qualification VARCHAR(100),
    qualifications JSONB, -- Array of qualifications with degree, institution, year
    specialization TEXT,
    experience_years INTEGER,
    previous_experience TEXT,
    
    -- Salary & Benefits
    basic_salary DECIMAL(12, 2),
    gross_salary DECIMAL(12, 2),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_ifsc VARCHAR(20),
    pf_number VARCHAR(50),
    esi_number VARCHAR(50),
    
    -- Documents
    photo_url TEXT,
    resume_url TEXT,
    documents JSONB, -- Array of document URLs with types
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relation VARCHAR(50),
    
    -- Medical
    medical_conditions TEXT,
    allergies TEXT,
    
    -- Additional
    subjects_can_teach JSONB, -- Array of subject IDs for teachers
    notes TEXT,
    
    -- Metadata
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create staff_attendance table
CREATE TABLE IF NOT EXISTS staff_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'half-day', 'on-leave', 'holiday')),
    leave_type VARCHAR(50) CHECK (leave_type IN ('casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid')),
    remarks TEXT,
    marked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, date)
);

-- Create staff_leaves table
CREATE TABLE IF NOT EXISTS staff_leaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid', 'compensatory')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approval_date TIMESTAMP,
    rejection_reason TEXT,
    documents JSONB, -- Medical certificates, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create staff_leave_balance table
CREATE TABLE IF NOT EXISTS staff_leave_balance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    total_allocated INTEGER NOT NULL,
    used INTEGER DEFAULT 0,
    balance INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(staff_id, academic_year_id, leave_type)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_staff_employee_id ON staff(employee_id);
CREATE INDEX IF NOT EXISTS idx_staff_staff_type ON staff(staff_type);
CREATE INDEX IF NOT EXISTS idx_staff_status ON staff(status);
CREATE INDEX IF NOT EXISTS idx_staff_department ON staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_staff ON staff_attendance(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_attendance_date ON staff_attendance(date);
CREATE INDEX IF NOT EXISTS idx_staff_leaves_staff ON staff_leaves(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_leaves_status ON staff_leaves(status);
CREATE INDEX IF NOT EXISTS idx_staff_leave_balance_staff ON staff_leave_balance(staff_id);

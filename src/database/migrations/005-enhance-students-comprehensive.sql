-- Comprehensive student schema enhancement to match Excel data (212 fields)

-- Add extensive student fields
ALTER TABLE students 
-- Roll number and identifiers
ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS family_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS pen_number VARCHAR(100), -- Permanent Education Number
ADD COLUMN IF NOT EXISTS apaar_id VARCHAR(100), -- APAAR ID
ADD COLUMN IF NOT EXISTS abha_number VARCHAR(100), -- Ayushman Bharat Health Account

-- Academic details
ADD COLUMN IF NOT EXISTS joining_date DATE,
ADD COLUMN IF NOT EXISTS class_of_first_admission VARCHAR(50),
ADD COLUMN IF NOT EXISTS previous_class_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS admission_year VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_new_student BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS groups TEXT, -- Science/Commerce/Humanities groups
ADD COLUMN IF NOT EXISTS house VARCHAR(50), -- School house
ADD COLUMN IF NOT EXISTS wing VARCHAR(50), -- Primary/Secondary wing
ADD COLUMN IF NOT EXISTS category_type VARCHAR(50), -- GEN/OBC/SC/ST
ADD COLUMN IF NOT EXISTS student_type VARCHAR(50), -- Day Scholar/Boarder
ADD COLUMN IF NOT EXISTS boarding_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS fee_category VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_single_child BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS special_needs TEXT,
ADD COLUMN IF NOT EXISTS student_tag TEXT,

-- Subjects and academics
ADD COLUMN IF NOT EXISTS subjects TEXT[], -- Array of subjects
ADD COLUMN IF NOT EXISTS optional_subjects TEXT[], -- Optional subjects
ADD COLUMN IF NOT EXISTS subject_codes TEXT[], -- Subject codes
ADD COLUMN IF NOT EXISTS scholastic_subjects TEXT,
ADD COLUMN IF NOT EXISTS co_scholastic_subjects TEXT,
ADD COLUMN IF NOT EXISTS main_subject VARCHAR(100),

-- Previous school
ADD COLUMN IF NOT EXISTS previous_school_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS previous_school_address TEXT,

-- Physical details
ADD COLUMN IF NOT EXISTS height_cm DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS vision_left VARCHAR(20),
ADD COLUMN IF NOT EXISTS vision_right VARCHAR(20),
ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS mother_tongue VARCHAR(50),

-- Personal details
ADD COLUMN IF NOT EXISTS religion VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_single_parent_child BOOLEAN DEFAULT false,

-- Parent/Guardian additional fields
ADD COLUMN IF NOT EXISTS father_salutation VARCHAR(20),
ADD COLUMN IF NOT EXISTS father_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_dob DATE,
ADD COLUMN IF NOT EXISTS father_qualification VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_profession VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_designation VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_office_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_office_address TEXT,
ADD COLUMN IF NOT EXISTS father_office_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS father_annual_income DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS father_aadhar_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS father_photo_url TEXT,
ADD COLUMN IF NOT EXISTS father_whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS father_card_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS father_is_staff BOOLEAN DEFAULT false,

ADD COLUMN IF NOT EXISTS mother_salutation VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_dob DATE,
ADD COLUMN IF NOT EXISTS mother_qualification VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_specialization VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_profession VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_designation VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_office_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_office_address TEXT,
ADD COLUMN IF NOT EXISTS mother_office_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_annual_income DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS mother_aadhar_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_photo_url TEXT,
ADD COLUMN IF NOT EXISTS mother_whatsapp_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_card_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS mother_is_staff BOOLEAN DEFAULT false,

-- Guardian details (for aunt, uncle, grandparents, etc.)
ADD COLUMN IF NOT EXISTS guardian_aunt_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_aunt_photo TEXT,
ADD COLUMN IF NOT EXISTS guardian_aunt_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS guardian_uncle_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_uncle_photo TEXT,
ADD COLUMN IF NOT EXISTS guardian_uncle_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS guardian_grandfather_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_grandfather_photo TEXT,
ADD COLUMN IF NOT EXISTS guardian_grandfather_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS guardian_grandmother_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_grandmother_photo TEXT,
ADD COLUMN IF NOT EXISTS guardian_grandmother_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS guardian_driver_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS guardian_driver_photo TEXT,
ADD COLUMN IF NOT EXISTS guardian_driver_contact VARCHAR(20),

-- Transport details
ADD COLUMN IF NOT EXISTS is_transport BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS transport_available TEXT,
ADD COLUMN IF NOT EXISTS pickup_route VARCHAR(100),
ADD COLUMN IF NOT EXISTS pickup_stop VARCHAR(100),
ADD COLUMN IF NOT EXISTS pickup_stop_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS pickup_time TIME,
ADD COLUMN IF NOT EXISTS pickup_bus_route_abb VARCHAR(50),
ADD COLUMN IF NOT EXISTS pickup_sequence INTEGER,
ADD COLUMN IF NOT EXISTS drop_route VARCHAR(100),
ADD COLUMN IF NOT EXISTS drop_stop VARCHAR(100),
ADD COLUMN IF NOT EXISTS drop_stop_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS drop_time TIME,
ADD COLUMN IF NOT EXISTS drop_bus_route_abb VARCHAR(50),
ADD COLUMN IF NOT EXISTS drop_sequence INTEGER,

-- Bus staff details (pickup)
ADD COLUMN IF NOT EXISTS pickup_driver_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS pickup_driver_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS pickup_driver_license VARCHAR(100),
ADD COLUMN IF NOT EXISTS pickup_driver_address TEXT,
ADD COLUMN IF NOT EXISTS pickup_conductor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS pickup_conductor_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS pickup_helper_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS pickup_helper_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS pickup_caretaker_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS pickup_caretaker_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS pickup_vehicle_details TEXT,

-- Bus staff details (drop)
ADD COLUMN IF NOT EXISTS drop_driver_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS drop_driver_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS drop_driver_license VARCHAR(100),
ADD COLUMN IF NOT EXISTS drop_driver_address TEXT,
ADD COLUMN IF NOT EXISTS drop_conductor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS drop_conductor_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS drop_helper_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS drop_helper_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS drop_caretaker_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS drop_caretaker_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS drop_vehicle_details TEXT,

ADD COLUMN IF NOT EXISTS seat_number VARCHAR(20),

-- Fee and bank details
ADD COLUMN IF NOT EXISTS fee_applicable_date DATE,
ADD COLUMN IF NOT EXISTS is_ecs BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_holder VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_account_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_micr_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_umrn VARCHAR(100),

-- Device and attendance
ADD COLUMN IF NOT EXISTS attendance_device_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS biometric_device VARCHAR(100),
ADD COLUMN IF NOT EXISTS rfid_card_number VARCHAR(100),

-- Mentoring and counseling
ADD COLUMN IF NOT EXISTS class_teacher_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mentor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS counselor_name VARCHAR(255),

-- Documents and photos
ADD COLUMN IF NOT EXISTS student_photo_url TEXT,
ADD COLUMN IF NOT EXISTS student_photo_path TEXT,
ADD COLUMN IF NOT EXISTS family_photo_url TEXT,
ADD COLUMN IF NOT EXISTS dob_certificate_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS aadhar_card_path TEXT,
ADD COLUMN IF NOT EXISTS birth_certificate_path TEXT,
ADD COLUMN IF NOT EXISTS passport_photo_path TEXT,
ADD COLUMN IF NOT EXISTS report_card_path TEXT,
ADD COLUMN IF NOT EXISTS studying_certificate_path TEXT,
ADD COLUMN IF NOT EXISTS document_paths JSONB, -- For multiple documents

-- Correspondence address
ADD COLUMN IF NOT EXISTS correspondence_address TEXT,
ADD COLUMN IF NOT EXISTS correspondence_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS correspondence_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS correspondence_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS correspondence_pincode VARCHAR(20),

-- Family details
ADD COLUMN IF NOT EXISTS number_of_sons INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS number_of_daughters INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS games_played TEXT[],

-- Withdrawal details
ADD COLUMN IF NOT EXISTS withdrawn_date DATE,
ADD COLUMN IF NOT EXISTS withdrawal_remarks TEXT,

-- System fields
ADD COLUMN IF NOT EXISTS school_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS section_strength INTEGER,
ADD COLUMN IF NOT EXISTS last_year_class VARCHAR(50);

-- Create siblings table
CREATE TABLE IF NOT EXISTS student_siblings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    sibling_student_id UUID REFERENCES students(id) ON DELETE SET NULL, -- If sibling is also a student
    sibling_name VARCHAR(255) NOT NULL,
    sibling_class VARCHAR(100),
    sibling_section VARCHAR(50),
    sibling_admission_number VARCHAR(100),
    sibling_relationship VARCHAR(50), -- Brother/Sister
    is_studying_in_school BOOLEAN DEFAULT true,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_siblings_student ON student_siblings(student_id);
CREATE INDEX idx_student_siblings_sibling ON student_siblings(sibling_student_id);

-- Create transport routes table
CREATE TABLE IF NOT EXISTS transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name VARCHAR(255) NOT NULL,
    route_abbreviation VARCHAR(50),
    route_type VARCHAR(20) CHECK (route_type IN ('pickup', 'drop', 'both')),
    vehicle_number VARCHAR(50),
    vehicle_details TEXT,
    driver_name VARCHAR(255),
    driver_contact VARCHAR(20),
    driver_license VARCHAR(100),
    conductor_name VARCHAR(255),
    conductor_contact VARCHAR(20),
    stops JSONB, -- Array of stop objects with name, time, sequence
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fee categories table
CREATE TABLE IF NOT EXISTS fee_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_family_id ON students(family_id);
CREATE INDEX IF NOT EXISTS idx_students_admission_year ON students(admission_year);
CREATE INDEX IF NOT EXISTS idx_students_house ON students(house);
CREATE INDEX IF NOT EXISTS idx_students_wing ON students(wing);
CREATE INDEX IF NOT EXISTS idx_students_religion ON students(religion);
CREATE INDEX IF NOT EXISTS idx_students_transport ON students(is_transport);
CREATE INDEX IF NOT EXISTS idx_students_fee_category ON students(fee_category);
CREATE INDEX IF NOT EXISTS idx_students_roll_number ON students(roll_number);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_student_siblings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_siblings_timestamp
    BEFORE UPDATE ON student_siblings
    FOR EACH ROW
    EXECUTE FUNCTION update_student_siblings_timestamp();

COMMENT ON TABLE student_siblings IS 'Stores sibling relationships between students';
COMMENT ON TABLE transport_routes IS 'School transport routes with stops and vehicle details';
COMMENT ON TABLE fee_categories IS 'Fee categories for different student groups';

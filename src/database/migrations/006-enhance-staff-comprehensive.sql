-- Comprehensive staff schema enhancement to match Excel data (79 fields)

ALTER TABLE staff
-- Additional identifiers
ADD COLUMN IF NOT EXISTS staff_code VARCHAR(100), -- Same as employee_id but keeping both
ADD COLUMN IF NOT EXISTS user_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS biometric_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS rfid_card_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS sequence_number INTEGER,

-- Extended personal details
ADD COLUMN IF NOT EXISTS salutation VARCHAR(20),
ADD COLUMN IF NOT EXISTS place_of_birth VARCHAR(100),
ADD COLUMN IF NOT EXISTS birth_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS marital_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS spouse_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS spouse_profession VARCHAR(255),
ADD COLUMN IF NOT EXISTS spouse_organization VARCHAR(255),
ADD COLUMN IF NOT EXISTS spouse_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS date_of_anniversary DATE,
ADD COLUMN IF NOT EXISTS father_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS father_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS mother_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS mother_contact VARCHAR(20),
ADD COLUMN IF NOT EXISTS religion VARCHAR(50),

-- Professional details
ADD COLUMN IF NOT EXISTS user_type VARCHAR(100), -- Teacher/Admin/Staff type
ADD COLUMN IF NOT EXISTS reporting_authority VARCHAR(255),
ADD COLUMN IF NOT EXISTS class_teacher_of VARCHAR(100), -- Which class they are class teacher of
ADD COLUMN IF NOT EXISTS class_incharge VARCHAR(100),
ADD COLUMN IF NOT EXISTS wing VARCHAR(50), -- Primary/Secondary/Senior
ADD COLUMN IF NOT EXISTS cost_center VARCHAR(100),
ADD COLUMN IF NOT EXISTS main_subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS qualification_subject VARCHAR(255),
ADD COLUMN IF NOT EXISTS subjects_can_teach TEXT[], -- Already exists but keeping for clarity

-- Experience and dates
ADD COLUMN IF NOT EXISTS total_working_experience VARCHAR(100), -- Can be "5 years 3 months" format
ADD COLUMN IF NOT EXISTS years_of_experience INTEGER,
ADD COLUMN IF NOT EXISTS date_of_regular DATE, -- Date of becoming regular staff
ADD COLUMN IF NOT EXISTS confirmation_date DATE,
ADD COLUMN IF NOT EXISTS service_end_date DATE,
ADD COLUMN IF NOT EXISTS relieving_date DATE,
ADD COLUMN IF NOT EXISTS relieving_reason TEXT,
ADD COLUMN IF NOT EXISTS joining_time VARCHAR(100), -- Time of joining as on today

-- Extended bank details
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_ifsc_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50), -- Cash/Bank/Cheque

-- Government IDs and documents
ADD COLUMN IF NOT EXISTS esi_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS pf_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS uan_number VARCHAR(100), -- Universal Account Number
ADD COLUMN IF NOT EXISTS pan_card_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS election_card_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS pension_fund_contribution VARCHAR(50), -- Yes/No/Amount

-- Correspondence address (if different from permanent)
ADD COLUMN IF NOT EXISTS correspondence_address TEXT,
ADD COLUMN IF NOT EXISTS correspondence_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS correspondence_state VARCHAR(100),
ADD COLUMN IF NOT EXISTS correspondence_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS correspondence_pincode VARCHAR(20),
ADD COLUMN IF NOT EXISTS permanent_pincode VARCHAR(20),

-- Transport details
ADD COLUMN IF NOT EXISTS pickup_bus_route VARCHAR(100),
ADD COLUMN IF NOT EXISTS pickup_bus_stop VARCHAR(100),
ADD COLUMN IF NOT EXISTS drop_bus_route VARCHAR(100),
ADD COLUMN IF NOT EXISTS drop_bus_stop VARCHAR(100),

-- Document uploads
ADD COLUMN IF NOT EXISTS is_upload_photo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_upload_signature BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS employee_photo_url TEXT,
ADD COLUMN IF NOT EXISTS employee_signature_url TEXT,
ADD COLUMN IF NOT EXISTS document_uploads JSONB, -- For multiple documents

-- Official communication
ADD COLUMN IF NOT EXISTS official_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS school_email VARCHAR(255),

-- Age calculation
ADD COLUMN IF NOT EXISTS age_as_of_today VARCHAR(50); -- "45 years 6 months" format

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_staff_staff_code ON staff(staff_code);
CREATE INDEX IF NOT EXISTS idx_staff_user_type ON staff(user_type);
CREATE INDEX IF NOT EXISTS idx_staff_reporting_authority ON staff(reporting_authority);
CREATE INDEX IF NOT EXISTS idx_staff_class_teacher ON staff(class_teacher_of);
CREATE INDEX IF NOT EXISTS idx_staff_wing ON staff(wing);
CREATE INDEX IF NOT EXISTS idx_staff_main_subject ON staff(main_subject);
CREATE INDEX IF NOT EXISTS idx_staff_marital_status ON staff(marital_status);
CREATE INDEX IF NOT EXISTS idx_staff_cost_center ON staff(cost_center);

-- Create staff qualifications table (for detailed qualification records)
CREATE TABLE IF NOT EXISTS staff_qualifications_detailed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    qualification_type VARCHAR(100), -- B.A., M.A., B.Ed, PhD, etc.
    qualification_subject VARCHAR(255),
    institution_name VARCHAR(255),
    university_name VARCHAR(255),
    year_of_passing INTEGER,
    percentage DECIMAL(5,2),
    grade VARCHAR(20),
    certificate_number VARCHAR(100),
    is_primary BOOLEAN DEFAULT false, -- Is this the primary/highest qualification
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_qualifications_staff ON staff_qualifications_detailed(staff_id);

-- Create staff experience table
CREATE TABLE IF NOT EXISTS staff_experience (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    organization_name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    department VARCHAR(255),
    from_date DATE NOT NULL,
    to_date DATE,
    is_current BOOLEAN DEFAULT false,
    duration_years INTEGER,
    duration_months INTEGER,
    responsibilities TEXT,
    reason_for_leaving TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_staff_experience_staff ON staff_experience(staff_id);

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_staff_qualifications_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_qualifications_timestamp
    BEFORE UPDATE ON staff_qualifications_detailed
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_qualifications_timestamp();

CREATE TRIGGER update_staff_experience_timestamp
    BEFORE UPDATE ON staff_experience
    FOR EACH ROW
    EXECUTE FUNCTION update_staff_qualifications_timestamp();

COMMENT ON TABLE staff_qualifications_detailed IS 'Detailed qualification records for staff members';
COMMENT ON TABLE staff_experience IS 'Previous work experience records for staff members';

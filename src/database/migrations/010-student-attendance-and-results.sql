-- Student attendance and examination results
-- Migration: 010-student-attendance-and-results.sql

CREATE TABLE IF NOT EXISTS student_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half-day', 'leave', 'holiday')),
    remarks TEXT,
    marked_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS student_exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    examination_id VARCHAR(100) NOT NULL,
    examination_name VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    marks_obtained DECIMAL(6,2) NOT NULL,
    total_marks DECIMAL(6,2) NOT NULL,
    grade VARCHAR(10),
    remarks TEXT,
    exam_date DATE,
    entered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, examination_id, subject)
);

CREATE INDEX IF NOT EXISTS idx_student_attendance_student_id ON student_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_student_attendance_date ON student_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_student_exam_results_student_id ON student_exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_exam_results_exam ON student_exam_results(examination_id);

CREATE OR REPLACE FUNCTION update_student_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_student_attendance_updated_at ON student_attendance;
CREATE TRIGGER trigger_update_student_attendance_updated_at
    BEFORE UPDATE ON student_attendance
    FOR EACH ROW
    EXECUTE FUNCTION update_student_attendance_updated_at();

CREATE OR REPLACE FUNCTION update_student_exam_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_student_exam_results_updated_at ON student_exam_results;
CREATE TRIGGER trigger_update_student_exam_results_updated_at
    BEFORE UPDATE ON student_exam_results
    FOR EACH ROW
    EXECUTE FUNCTION update_student_exam_results_updated_at();

-- Increase limits for fields that commonly have long values

ALTER TABLE students 
ALTER COLUMN student_photo_url TYPE TEXT,
ALTER COLUMN student_photo_path TYPE TEXT,
ALTER COLUMN family_photo_url TYPE TEXT,
ALTER COLUMN scholastic_subjects TYPE TEXT,
ALTER COLUMN co_scholastic_subjects TYPE TEXT,
ALTER COLUMN main_subject TYPE TEXT;

-- Also increase image/document fields for staff
ALTER TABLE staff
ALTER COLUMN employee_photo_url TYPE TEXT,
ALTER COLUMN employee_signature_url TYPE TEXT;

COMMENT ON COLUMN students.student_photo_url IS 'URL or path to student photo (TEXT for long URLs)';
COMMENT ON COLUMN students.scholastic_subjects IS 'Comma-separated list of scholastic subjects (TEXT for long lists)';

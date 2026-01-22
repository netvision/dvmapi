-- Enhance classes and sections tables with comprehensive metadata

ALTER TABLE classes
ADD COLUMN IF NOT EXISTS class_abbreviation VARCHAR(50),
ADD COLUMN IF NOT EXISTS wing VARCHAR(50), -- Primary/Middle/Secondary/Senior Secondary
ADD COLUMN IF NOT EXISTS class_teacher_id UUID REFERENCES staff(id),
ADD COLUMN IF NOT EXISTS total_sections INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS display_order INTEGER, -- For custom sorting
ADD COLUMN IF NOT EXISTS remarks TEXT;

ALTER TABLE sections
ADD COLUMN IF NOT EXISTS section_abbreviation VARCHAR(20),
ADD COLUMN IF NOT EXISTS wing VARCHAR(50),
ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_boys INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_girls INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS academic_year_id UUID REFERENCES academic_years(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS floor_number INTEGER,
ADD COLUMN IF NOT EXISTS building_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Create function to update student counts
CREATE OR REPLACE FUNCTION update_class_section_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update section counts
    UPDATE sections s
    SET total_students = (
        SELECT COUNT(*) FROM students 
        WHERE class = (SELECT name FROM classes WHERE id = s.class_id)
        AND section = s.name
        AND status = 'active'
    ),
    total_boys = (
        SELECT COUNT(*) FROM students 
        WHERE class = (SELECT name FROM classes WHERE id = s.class_id)
        AND section = s.name
        AND gender = 'male'
        AND status = 'active'
    ),
    total_girls = (
        SELECT COUNT(*) FROM students 
        WHERE class = (SELECT name FROM classes WHERE id = s.class_id)
        AND section = s.name
        AND gender = 'female'
        AND status = 'active'
    );
    
    -- Update class counts
    UPDATE classes c
    SET total_students = (
        SELECT COUNT(*) FROM students 
        WHERE class = c.name
        AND status = 'active'
    ),
    total_sections = (
        SELECT COUNT(*) FROM sections 
        WHERE class_id = c.id
        AND is_active = true
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update counts when students are added/modified
CREATE TRIGGER update_student_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON students
    FOR EACH STATEMENT
    EXECUTE FUNCTION update_class_section_counts();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_classes_wing ON classes(wing);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_sections_wing ON sections(wing);
CREATE INDEX IF NOT EXISTS idx_sections_teacher ON sections(class_teacher_id);
CREATE INDEX IF NOT EXISTS idx_sections_academic_year ON sections(academic_year_id);

-- Update existing classes with wing based on level
UPDATE classes 
SET wing = CASE 
    WHEN level = 'pre-primary' THEN 'Pre-Primary'
    WHEN level = 'primary' THEN 'Primary'
    WHEN level = 'middle' THEN 'Middle'
    WHEN level = 'secondary' THEN 'Secondary'
    WHEN level = 'senior-secondary' THEN 'Senior Secondary'
    ELSE 'General'
END
WHERE wing IS NULL;

-- Update class abbreviations
UPDATE classes 
SET class_abbreviation = name
WHERE class_abbreviation IS NULL;

COMMENT ON COLUMN classes.wing IS 'Academic wing: Pre-Primary, Primary, Middle, Secondary, Senior Secondary';
COMMENT ON COLUMN classes.class_teacher_id IS 'Primary class teacher/coordinator for this class';
COMMENT ON COLUMN sections.wing IS 'Academic wing assignment';
COMMENT ON COLUMN sections.floor_number IS 'Floor number where section classroom is located';

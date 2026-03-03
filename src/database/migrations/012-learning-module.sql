-- =============================================================================
-- Migration 012 : Learning Module — Full Setup
-- =============================================================================
-- Safe to run on any server state (all statements use IF NOT EXISTS / IF NOT EXISTS).
-- Run after migrations 001–011.
-- =============================================================================

-- ─── Prerequisites: ensure uuid extension ─────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. academic_years ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_academic_years_current ON academic_years(is_current);

-- ─── 2. classes ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    level VARCHAR(50),
    sequence_order INTEGER,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    class_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    capacity INTEGER,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(level);
CREATE INDEX IF NOT EXISTS idx_classes_sequence ON classes(sequence_order);

-- ─── 3. sections ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL,
    capacity INTEGER DEFAULT 40,
    room_number VARCHAR(50),
    class_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, name)
);
CREATE INDEX IF NOT EXISTS idx_sections_class ON sections(class_id);

-- ─── 4. subjects (ensure code column exists and is unique) ────────────────
ALTER TABLE IF EXISTS subjects ADD COLUMN IF NOT EXISTS code VARCHAR(20);
ALTER TABLE IF EXISTS subjects ADD COLUMN IF NOT EXISTS subject_type VARCHAR(50) DEFAULT 'core';
ALTER TABLE IF EXISTS subjects ADD COLUMN IF NOT EXISTS is_practical BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS subjects ADD COLUMN IF NOT EXISTS passing_marks INTEGER;
ALTER TABLE IF EXISTS subjects ADD COLUMN IF NOT EXISTS total_marks INTEGER;
ALTER TABLE IF EXISTS subjects ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE IF EXISTS subjects ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_subjects_code_unique ON subjects(code) WHERE code IS NOT NULL;

-- ─── 5. class_subjects ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS class_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN DEFAULT true,
    theory_marks INTEGER,
    practical_marks INTEGER,
    internal_marks INTEGER,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id)
);
CREATE INDEX IF NOT EXISTS idx_class_subjects_class ON class_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_class_subjects_subject ON class_subjects(subject_id);

-- ─── 6. teacher_subjects ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    section_id UUID REFERENCES sections(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, class_id, subject_id, section_id, academic_year_id)
);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_class ON teacher_subjects(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject ON teacher_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_academic_year ON teacher_subjects(academic_year_id);

-- ─── 7. learning_chapters ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    chapter_no VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, subject_id, title)
);
ALTER TABLE IF EXISTS learning_chapters ADD COLUMN IF NOT EXISTS chapter_no VARCHAR(50);
ALTER TABLE IF EXISTS learning_chapters ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);
CREATE INDEX IF NOT EXISTS idx_learning_chapters_class_subject ON learning_chapters(class_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_learning_chapters_subject ON learning_chapters(subject_id);

-- ─── 8. learning_key_concepts ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_key_concepts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    chapter_id UUID NOT NULL REFERENCES learning_chapters(id) ON DELETE CASCADE,
    total_sessions_required INTEGER NOT NULL CHECK (total_sessions_required > 0),
    session_duration_minutes INTEGER CHECK (session_duration_minutes > 0),
    difficulty_level VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    prerequisites JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_learning_key_concepts_chapter ON learning_key_concepts(chapter_id);
CREATE INDEX IF NOT EXISTS idx_learning_key_concepts_difficulty ON learning_key_concepts(difficulty_level);

-- ─── 9. learning_lesson_plans ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS learning_lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_concept_id UUID NOT NULL UNIQUE REFERENCES learning_key_concepts(id) ON DELETE CASCADE,

    -- Planning
    learning_outcomes JSONB DEFAULT '[]'::jsonb,
    teaching_method VARCHAR(20) CHECK (teaching_method IN ('lecture', 'activity', 'discussion', 'project')),
    instructional_steps JSONB DEFAULT '[]'::jsonb,
    teaching_aids JSONB DEFAULT '[]'::jsonb,
    required_materials JSONB DEFAULT '[]'::jsonb,

    -- Delivery
    actual_content TEXT,
    content_text TEXT,
    content_images JSONB DEFAULT '[]'::jsonb,
    content_audio JSONB DEFAULT '[]'::jsonb,
    content_videos JSONB DEFAULT '[]'::jsonb,
    student_activities JSONB DEFAULT '[]'::jsonb,
    integration TEXT,
    other_subjects JSONB DEFAULT '[]'::jsonb,
    library_references JSONB DEFAULT '[]'::jsonb,
    life_lessons TEXT,

    -- Evaluation
    assessment_method TEXT,
    rubric TEXT,
    homework_assigned TEXT,
    assessment_remarks TEXT,
    progress_status VARCHAR(20) NOT NULL DEFAULT 'notStarted'
        CHECK (progress_status IN ('notStarted', 'ongoing', 'completed')),

    -- Reflection
    teacher_reflection TEXT,
    improvements_for_next_time TEXT,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_plans_key_concept ON learning_lesson_plans(key_concept_id);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_plans_progress ON learning_lesson_plans(progress_status);
CREATE INDEX IF NOT EXISTS idx_learning_lesson_plans_created_by ON learning_lesson_plans(created_by);

-- ─── Done ──────────────────────────────────────────────────────────────────

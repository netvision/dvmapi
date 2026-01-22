import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

try {
  await pool.query('DROP TABLE IF EXISTS syllabus CASCADE');
  await pool.query('DROP TABLE IF EXISTS learning_content CASCADE');
  await pool.query('DROP TABLE IF EXISTS teacher_subjects CASCADE');
  await pool.query('DROP TABLE IF EXISTS class_subjects CASCADE');
  await pool.query('DROP TABLE IF EXISTS subjects CASCADE');
  
  await pool.query(`
    CREATE TABLE subjects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR(100) NOT NULL,
      code VARCHAR(20) UNIQUE NOT NULL,
      description TEXT,
      subject_type VARCHAR(50) DEFAULT 'core' CHECK (subject_type IN ('core', 'elective', 'language', 'vocational', 'co-curricular')),
      is_practical BOOLEAN DEFAULT false,
      passing_marks INTEGER,
      total_marks INTEGER,
      created_by UUID REFERENCES users(id) ON DELETE SET NULL,
      updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE class_subjects (
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
    
    CREATE TABLE teacher_subjects (
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
  `);
  
  console.log('✅ Subject tables recreated');
  await pool.end();
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}

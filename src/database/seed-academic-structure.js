import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const cbseClasses = [
  { name: 'Nursery', display_name: 'Nursery', level: 'pre-primary', sequence: 1 },
  { name: 'LKG', display_name: 'Lower Kindergarten (LKG)', level: 'pre-primary', sequence: 2 },
  { name: 'UKG', display_name: 'Upper Kindergarten (UKG)', level: 'pre-primary', sequence: 3 },
  { name: 'I', display_name: 'Class I', level: 'primary', sequence: 4 },
  { name: 'II', display_name: 'Class II', level: 'primary', sequence: 5 },
  { name: 'III', display_name: 'Class III', level: 'primary', sequence: 6 },
  { name: 'IV', display_name: 'Class IV', level: 'primary', sequence: 7 },
  { name: 'V', display_name: 'Class V', level: 'primary', sequence: 8 },
  { name: 'VI', display_name: 'Class VI', level: 'middle', sequence: 9 },
  { name: 'VII', display_name: 'Class VII', level: 'middle', sequence: 10 },
  { name: 'VIII', display_name: 'Class VIII', level: 'middle', sequence: 11 },
  { name: 'IX', display_name: 'Class IX', level: 'secondary', sequence: 12 },
  { name: 'X', display_name: 'Class X', level: 'secondary', sequence: 13 },
  { name: 'XI-Science', display_name: 'Class XI - Science', level: 'senior-secondary', sequence: 14 },
  { name: 'XI-Commerce', display_name: 'Class XI - Commerce', level: 'senior-secondary', sequence: 15 },
  { name: 'XI-Humanities', display_name: 'Class XI - Humanities', level: 'senior-secondary', sequence: 16 },
  { name: 'XII-Science', display_name: 'Class XII - Science', level: 'senior-secondary', sequence: 17 },
  { name: 'XII-Commerce', display_name: 'Class XII - Commerce', level: 'senior-secondary', sequence: 18 },
  { name: 'XII-Humanities', display_name: 'Class XII - Humanities', level: 'senior-secondary', sequence: 19 }
];

const cbseSubjects = [
  // Primary Level (I-V)
  { name: 'English', code: 'ENG', type: 'language', total_marks: 100, passing_marks: 33 },
  { name: 'Hindi', code: 'HIN', type: 'language', total_marks: 100, passing_marks: 33 },
  { name: 'Mathematics', code: 'MAT', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Environmental Studies (EVS)', code: 'EVS', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'General Knowledge', code: 'GK', type: 'core', total_marks: 50, passing_marks: 17 },
  
  // Middle Level (VI-VIII)
  { name: 'Science', code: 'SCI', type: 'core', total_marks: 100, passing_marks: 33, is_practical: true },
  { name: 'Social Science', code: 'SST', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Sanskrit', code: 'SAN', type: 'language', total_marks: 100, passing_marks: 33 },
  
  // Secondary Level (IX-X)
  { name: 'Physics', code: 'PHY', type: 'core', total_marks: 100, passing_marks: 33, is_practical: true },
  { name: 'Chemistry', code: 'CHE', type: 'core', total_marks: 100, passing_marks: 33, is_practical: true },
  { name: 'Biology', code: 'BIO', type: 'core', total_marks: 100, passing_marks: 33, is_practical: true },
  { name: 'History', code: 'HIS', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Geography', code: 'GEO', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Civics', code: 'CIV', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Economics', code: 'ECO', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Information Technology', code: 'IT', type: 'vocational', total_marks: 100, passing_marks: 33 },
  
  // Senior Secondary - Science
  { name: 'Computer Science', code: 'CS', type: 'elective', total_marks: 100, passing_marks: 33, is_practical: true },
  { name: 'Physical Education', code: 'PE', type: 'elective', total_marks: 100, passing_marks: 33 },
  
  // Senior Secondary - Commerce
  { name: 'Accountancy', code: 'ACC', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Business Studies', code: 'BS', type: 'core', total_marks: 100, passing_marks: 33 },
  
  // Senior Secondary - Humanities
  { name: 'Political Science', code: 'PS', type: 'core', total_marks: 100, passing_marks: 33 },
  { name: 'Psychology', code: 'PSY', type: 'elective', total_marks: 100, passing_marks: 33 },
  { name: 'Sociology', code: 'SOC', type: 'elective', total_marks: 100, passing_marks: 33 },
  
  // Co-curricular
  { name: 'Art & Craft', code: 'ART', type: 'co-curricular', total_marks: 50, passing_marks: 17 },
  { name: 'Music', code: 'MUS', type: 'co-curricular', total_marks: 50, passing_marks: 17 },
  { name: 'Dance', code: 'DAN', type: 'co-curricular', total_marks: 50, passing_marks: 17 }
];

const classSubjectMapping = {
  'Nursery': ['GK', 'ART', 'MUS'],
  'LKG': ['GK', 'ART', 'MUS'],
  'UKG': ['ENG', 'HIN', 'MAT', 'GK', 'ART', 'MUS'],
  'I': ['ENG', 'HIN', 'MAT', 'EVS', 'GK', 'ART'],
  'II': ['ENG', 'HIN', 'MAT', 'EVS', 'GK', 'ART'],
  'III': ['ENG', 'HIN', 'MAT', 'EVS', 'GK', 'ART'],
  'IV': ['ENG', 'HIN', 'MAT', 'EVS', 'GK', 'ART'],
  'V': ['ENG', 'HIN', 'MAT', 'EVS', 'GK', 'ART'],
  'VI': ['ENG', 'HIN', 'MAT', 'SCI', 'SST', 'SAN', 'IT', 'ART', 'PE'],
  'VII': ['ENG', 'HIN', 'MAT', 'SCI', 'SST', 'SAN', 'IT', 'ART', 'PE'],
  'VIII': ['ENG', 'HIN', 'MAT', 'SCI', 'SST', 'SAN', 'IT', 'ART', 'PE'],
  'IX': ['ENG', 'HIN', 'MAT', 'SCI', 'SST', 'IT', 'PE'],
  'X': ['ENG', 'HIN', 'MAT', 'SCI', 'SST', 'IT', 'PE'],
  'XI-Science': ['ENG', 'PHY', 'CHE', 'MAT', 'CS', 'PE'],
  'XI-Commerce': ['ENG', 'ACC', 'BS', 'ECO', 'MAT', 'IT'],
  'XI-Humanities': ['ENG', 'HIS', 'GEO', 'PS', 'ECO', 'PSY'],
  'XII-Science': ['ENG', 'PHY', 'CHE', 'MAT', 'CS', 'PE'],
  'XII-Commerce': ['ENG', 'ACC', 'BS', 'ECO', 'MAT', 'IT'],
  'XII-Humanities': ['ENG', 'HIS', 'GEO', 'PS', 'ECO', 'PSY']
};

const sections = ['A', 'B', 'C'];

async function seedAcademicStructure() {
  const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('🌱 Seeding academic structure...');
    
    // Get admin user ID
    const adminResult = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@institute.com'"
    );
    const adminId = adminResult.rows[0]?.id;
    
    // 1. Create Academic Year
    console.log('Creating academic year...');
    const yearResult = await pool.query(
      `INSERT INTO academic_years (name, start_date, end_date, is_current, created_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (name) DO UPDATE SET is_current = EXCLUDED.is_current
       RETURNING id`,
      ['2025-2026', '2025-04-01', '2026-03-31', true, adminId]
    );
    const academicYearId = yearResult.rows[0].id;
    console.log('✅ Academic year created');
    
    // 2. Create Subjects
    console.log('Creating subjects...');
    const subjectIds = {};
    for (const subject of cbseSubjects) {
      const result = await pool.query(
        `INSERT INTO subjects (name, code, subject_type, is_practical, total_marks, passing_marks, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
         RETURNING id, code`,
        [subject.name, subject.code, subject.type, subject.is_practical || false, 
         subject.total_marks, subject.passing_marks, adminId]
      );
      subjectIds[subject.code] = result.rows[0].id;
    }
    console.log(`✅ Created ${Object.keys(subjectIds).length} subjects`);
    
    // 3. Create Classes
    console.log('Creating classes...');
    const classIds = {};
    for (const cls of cbseClasses) {
      const result = await pool.query(
        `INSERT INTO classes (name, display_name, level, sequence_order, academic_year_id, capacity, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (name, academic_year_id) DO UPDATE SET display_name = EXCLUDED.display_name
         RETURNING id, name`,
        [cls.name, cls.display_name, cls.level, cls.sequence, academicYearId, 120, adminId]
      );
      classIds[cls.name] = result.rows[0].id;
    }
    console.log(`✅ Created ${Object.keys(classIds).length} classes`);
    
    // 4. Create Sections
    console.log('Creating sections...');
    let sectionCount = 0;
    for (const className of Object.keys(classIds)) {
      for (const sectionName of sections) {
        await pool.query(
          `INSERT INTO sections (class_id, name, capacity, created_by)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (class_id, name) DO NOTHING`,
          [classIds[className], sectionName, 40, adminId]
        );
        sectionCount++;
      }
    }
    console.log(`✅ Created ${sectionCount} sections`);
    
    // 5. Assign Subjects to Classes
    console.log('Assigning subjects to classes...');
    let assignmentCount = 0;
    for (const [className, subjectCodes] of Object.entries(classSubjectMapping)) {
      const classId = classIds[className];
      for (const code of subjectCodes) {
        const subjectId = subjectIds[code];
        if (subjectId) {
          await pool.query(
            `INSERT INTO class_subjects (class_id, subject_id, is_mandatory, created_by)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (class_id, subject_id) DO NOTHING`,
            [classId, subjectId, true, adminId]
          );
          assignmentCount++;
        }
      }
    }
    console.log(`✅ Created ${assignmentCount} class-subject assignments`);
    
    // Summary
    console.log('\n📊 Academic Structure Summary:');
    console.log(`  Academic Year: 2025-2026`);
    console.log(`  Classes: ${Object.keys(classIds).length}`);
    console.log(`  Sections: ${sectionCount} (3 per class)`);
    console.log(`  Subjects: ${Object.keys(subjectIds).length}`);
    console.log(`  Class-Subject Mappings: ${assignmentCount}`);
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding academic structure:', error);
    process.exit(1);
  }
}

seedAcademicStructure();

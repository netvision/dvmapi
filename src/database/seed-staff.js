import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const teacherDesignations = ['Principal', 'Vice Principal', 'Head Teacher', 'PGT', 'TGT', 'PRT', 'Nursery Teacher', 'Sports Teacher', 'Music Teacher', 'Art Teacher'];
const nonTeachingDesignations = ['Office Manager', 'Accountant', 'Clerk', 'Lab Assistant', 'Librarian', 'Peon', 'Security Guard', 'Driver', 'Sweeper'];
const departments = ['Science', 'Mathematics', 'English', 'Hindi', 'Social Science', 'Commerce', 'Humanities', 'Administration', 'Accounts', 'Library', 'Sports', 'Arts'];

const qualifications = ['Ph.D.', 'M.Phil.', 'M.Ed.', 'B.Ed.', 'M.A.', 'M.Sc.', 'M.Com.', 'B.A.', 'B.Sc.', 'B.Com.', 'Diploma', '12th Pass', '10th Pass'];

const firstNames = {
  male: ['Rajesh', 'Amit', 'Suresh', 'Vikram', 'Anil', 'Manoj', 'Santosh', 'Ramesh', 'Dinesh', 'Prakash', 'Ajay', 'Vijay', 'Sanjay', 'Ashok', 'Deepak'],
  female: ['Priya', 'Sunita', 'Rekha', 'Meera', 'Kavita', 'Anjali', 'Pooja', 'Neha', 'Ritu', 'Seema', 'Madhuri', 'Shilpa', 'Vandana', 'Nisha', 'Preeti']
};

const lastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Joshi', 'Agarwal', 'Mehta', 'Shah', 'Reddy', 'Nair', 'Iyer', 'Das', 'Roy'];

const subjects = ['Mathematics', 'English', 'Hindi', 'Science', 'Physics', 'Chemistry', 'Biology', 'Social Science', 'History', 'Geography', 'Economics', 'Accountancy', 'Computer Science'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateEmployeeId(year, index) {
  return `EMP${year}${String(index).padStart(4, '0')}`;
}

function generatePhone() {
  return `${Math.floor(Math.random() * 900000000) + 9000000000}`;
}

function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@institute.com`;
}

function generateDOB() {
  const currentYear = 2026;
  const age = Math.floor(Math.random() * 20) + 25; // 25-45 years old
  const birthYear = currentYear - age;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${birthYear}-${month}-${day}`;
}

function generateJoiningDate() {
  const year = Math.floor(Math.random() * 15) + 2010; // Joined between 2010-2024
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateSalary(designation) {
  if (['Principal', 'Vice Principal'].includes(designation)) return Math.floor(Math.random() * 30000) + 80000;
  if (['PGT', 'Head Teacher'].includes(designation)) return Math.floor(Math.random() * 20000) + 50000;
  if (['TGT', 'PRT'].includes(designation)) return Math.floor(Math.random() * 15000) + 35000;
  if (['Nursery Teacher', 'Sports Teacher', 'Music Teacher'].includes(designation)) return Math.floor(Math.random() * 10000) + 25000;
  if (['Office Manager', 'Accountant', 'Librarian'].includes(designation)) return Math.floor(Math.random() * 15000) + 30000;
  return Math.floor(Math.random() * 10000) + 15000;
}

async function seedStaff() {
  const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('🌱 Seeding staff data...');
    
    const adminResult = await pool.query("SELECT id FROM users WHERE email = 'admin@institute.com'");
    const adminId = adminResult.rows[0]?.id;
    
    const academicYearResult = await pool.query("SELECT id FROM academic_years WHERE name = '2025-2026'");
    const academicYearId = academicYearResult.rows[0]?.id;
    
    let staffCount = 0;
    
    // Create 35 teaching staff
    for (let i = 0; i < 35; i++) {
      staffCount++;
      const gender = Math.random() > 0.4 ? 'female' : 'male'; // More female teachers
      const firstName = randomItem(firstNames[gender]);
      const lastName = randomItem(lastNames);
      const designation = i === 0 ? 'Principal' : i === 1 ? 'Vice Principal' : randomItem(teacherDesignations.slice(2));
      const department = randomItem(departments.slice(0, 11)); // Teaching departments
      const qualification = randomItem(qualifications.slice(0, 5));
      const basicSalary = generateSalary(designation);
      
      const qualificationsArray = [
        {
          degree: qualification,
          institution: `${randomItem(['Delhi', 'Mumbai', 'Bangalore', 'Kolkata'])} University`,
          year: Math.floor(Math.random() * 15) + 2000,
          specialization: randomItem(subjects)
        }
      ];
      
      const subjectsCanTeach = designation.includes('Teacher') && !['Sports', 'Music', 'Art'].some(s => designation.includes(s))
        ? [randomItem(subjects), randomItem(subjects)].filter((v, i, a) => a.indexOf(v) === i)
        : designation.includes('Sports') ? ['Physical Education'] 
        : designation.includes('Music') ? ['Music']
        : designation.includes('Art') ? ['Art & Craft']
        : [];
      
      await pool.query(
        `INSERT INTO staff (
          employee_id, first_name, last_name, date_of_birth, gender, blood_group,
          nationality, religion, category, marital_status, email, phone,
          address, city, state, pincode, staff_type, designation, department,
          date_of_joining, employment_type, status, highest_qualification,
          qualifications, specialization, experience_years, basic_salary,
          gross_salary, bank_name, bank_account_number, bank_ifsc,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          subjects_can_teach, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36
        )`,
        [
          generateEmployeeId(2020, staffCount),
          firstName, lastName, generateDOB(), gender,
          randomItem(['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']),
          'Indian', randomItem(['Hindu', 'Muslim', 'Christian', 'Sikh', 'Other']),
          randomItem(['general', 'obc', 'sc', 'st']),
          randomItem(['married', 'single']),
          generateEmail(firstName, lastName), generatePhone(),
          `${Math.floor(Math.random() * 999) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
          randomItem(['Delhi', 'Noida', 'Gurgaon', 'Faridabad']),
          'Delhi', String(Math.floor(Math.random() * 900000) + 100000),
          'teaching', designation, department, generateJoiningDate(),
          randomItem(['permanent', 'contract']), 'active',
          qualification, JSON.stringify(qualificationsArray),
          randomItem(subjects), Math.floor(Math.random() * 15) + 2,
          basicSalary, Math.floor(basicSalary * 1.2),
          randomItem(['SBI', 'HDFC', 'ICICI', 'Axis', 'PNB']),
          String(Math.floor(Math.random() * 9000000000) + 1000000000),
          `${randomItem(['SBIN', 'HDFC', 'ICIC', 'UTIB', 'PUNB'])}0001234`,
          `${randomItem(firstNames.male)} ${lastName}`, generatePhone(),
          randomItem(['Spouse', 'Parent', 'Sibling']),
          JSON.stringify(subjectsCanTeach), adminId
        ]
      );
    }
    
    // Create 15 non-teaching staff
    for (let i = 0; i < 15; i++) {
      staffCount++;
      const gender = Math.random() > 0.5 ? 'male' : 'female';
      const firstName = randomItem(firstNames[gender]);
      const lastName = randomItem(lastNames);
      const designation = randomItem(nonTeachingDesignations);
      const staffType = ['Office Manager', 'Accountant', 'Clerk'].includes(designation) ? 'administrative' : 'support';
      const department = designation === 'Librarian' ? 'Library' : 'Administration';
      const qualification = randomItem(qualifications.slice(3));
      const basicSalary = generateSalary(designation);
      
      await pool.query(
        `INSERT INTO staff (
          employee_id, first_name, last_name, date_of_birth, gender,
          email, phone, address, city, state, pincode,
          staff_type, designation, department, date_of_joining,
          employment_type, status, highest_qualification,
          experience_years, basic_salary, gross_salary,
          bank_name, bank_account_number, bank_ifsc,
          emergency_contact_name, emergency_contact_phone,
          emergency_contact_relation, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28
        )`,
        [
          generateEmployeeId(2020, staffCount),
          firstName, lastName, generateDOB(), gender,
          generateEmail(firstName, lastName), generatePhone(),
          `${Math.floor(Math.random() * 999) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
          randomItem(['Delhi', 'Noida', 'Gurgaon']),
          'Delhi', String(Math.floor(Math.random() * 900000) + 100000),
          staffType, designation, department, generateJoiningDate(),
          randomItem(['permanent', 'contract', 'temporary']), 'active',
          qualification, Math.floor(Math.random() * 10) + 1,
          basicSalary, Math.floor(basicSalary * 1.15),
          randomItem(['SBI', 'HDFC', 'ICICI', 'PNB']),
          String(Math.floor(Math.random() * 9000000000) + 1000000000),
          `${randomItem(['SBIN', 'HDFC', 'ICIC', 'PUNB'])}0001234`,
          `${randomItem(firstNames.male)} ${lastName}`, generatePhone(),
          randomItem(['Spouse', 'Parent', 'Sibling']), adminId
        ]
      );
    }
    
    // Create leave balances for all staff
    console.log('Creating leave balances...');
    const allStaff = await pool.query('SELECT id, staff_type FROM staff');
    
    for (const staff of allStaff.rows) {
      const leaveTypes = ['casual', 'sick', 'earned'];
      for (const leaveType of leaveTypes) {
        const allocated = leaveType === 'casual' ? 10 : leaveType === 'sick' ? 7 : 15;
        await pool.query(
          `INSERT INTO staff_leave_balance (staff_id, academic_year_id, leave_type, total_allocated, balance)
           VALUES ($1, $2, $3, $4, $5)`,
          [staff.id, academicYearId, leaveType, allocated, allocated]
        );
      }
    }
    
    console.log(`✅ Successfully created ${staffCount} staff members`);
    console.log(`   - Teaching Staff: 35`);
    console.log(`   - Non-Teaching Staff: 15`);
    console.log(`   - Leave Balances Created: ${staffCount * 3}`);
    
    const summary = await pool.query(`
      SELECT staff_type, designation, COUNT(*) as count
      FROM staff
      GROUP BY staff_type, designation
      ORDER BY staff_type, count DESC
    `);
    
    console.log('\n📊 Staff by Type & Designation:');
    summary.rows.forEach(row => {
      console.log(`  ${row.designation} (${row.staff_type}): ${row.count}`);
    });
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding staff:', error);
    process.exit(1);
  }
}

seedStaff();

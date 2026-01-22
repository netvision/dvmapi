import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const classes = [
  'Nursery', 'LKG', 'UKG',
  'I', 'II', 'III', 'IV', 'V',
  'VI', 'VII', 'VIII',
  'IX', 'X',
  'XI-Science', 'XI-Commerce', 'XI-Humanities',
  'XII-Science', 'XII-Commerce', 'XII-Humanities'
];

const sections = ['A', 'B', 'C'];
const genders = ['male', 'female'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const religions = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'];
const categories = ['general', 'obc', 'sc', 'st'];

const firstNames = {
  male: ['Aarav', 'Arjun', 'Dhruv', 'Ishaan', 'Krishna', 'Lakshay', 'Mohit', 'Naman', 'Pranav', 'Rohan', 'Sahil', 'Tanishq', 'Varun', 'Yash', 'Aditya', 'Ankit', 'Deepak', 'Gaurav', 'Harsh', 'Kartik'],
  female: ['Aaradhya', 'Ananya', 'Diya', 'Ishita', 'Jiya', 'Kavya', 'Mira', 'Navya', 'Priya', 'Riya', 'Saanvi', 'Tanya', 'Vanya', 'Zara', 'Aisha', 'Divya', 'Pooja', 'Shruti', 'Sneha', 'Tanvi']
};

const lastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Patel', 'Reddy', 'Agarwal', 'Jain', 'Mehta', 'Shah', 'Malhotra', 'Kapoor', 'Chopra', 'Nair', 'Iyer', 'Khan', 'Das', 'Roy', 'Desai'];

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Chandigarh'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAdmissionNumber(year, index) {
  return `${year}${String(index).padStart(4, '0')}`;
}

function generateAadhaar() {
  return String(Math.floor(Math.random() * 900000000000) + 100000000000);
}

function generatePhone() {
  return `${Math.floor(Math.random() * 900000000) + 9000000000}`;
}

function generateEmail(firstName, lastName) {
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
}

function generateDOB(classLevel) {
  const currentYear = 2026;
  let age;
  
  if (classLevel === 'Nursery') age = 3;
  else if (classLevel === 'LKG') age = 4;
  else if (classLevel === 'UKG') age = 5;
  else if (classLevel === 'I') age = 6;
  else if (classLevel === 'II') age = 7;
  else if (classLevel === 'III') age = 8;
  else if (classLevel === 'IV') age = 9;
  else if (classLevel === 'V') age = 10;
  else if (classLevel === 'VI') age = 11;
  else if (classLevel === 'VII') age = 12;
  else if (classLevel === 'VIII') age = 13;
  else if (classLevel === 'IX') age = 14;
  else if (classLevel === 'X') age = 15;
  else if (classLevel.startsWith('XI')) age = 16;
  else if (classLevel.startsWith('XII')) age = 17;
  else age = 10;
  
  const birthYear = currentYear - age;
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  return `${birthYear}-${month}-${day}`;
}

async function seedStudents() {
  const pool = new pg.Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });
  
  try {
    console.log('🌱 Seeding students data...');
    
    // Get admin user ID for created_by
    const adminResult = await pool.query(
      "SELECT id FROM users WHERE email = 'admin@institute.com'"
    );
    const adminId = adminResult.rows[0]?.id;
    
    let studentCount = 0;
    const academicYear = '2025-2026';
    
    // Create 8-12 students per class
    for (const classLevel of classes) {
      const studentsPerClass = Math.floor(Math.random() * 5) + 8; // 8-12 students
      const section = randomItem(sections);
      
      for (let i = 0; i < studentsPerClass; i++) {
        studentCount++;
        const gender = randomItem(genders);
        const firstName = randomItem(firstNames[gender]);
        const lastName = randomItem(lastNames);
        const admissionNumber = generateAdmissionNumber(2025, studentCount);
        const rollNumber = `${classLevel}-${section}-${String(i + 1).padStart(2, '0')}`;
        
        const student = {
          admission_number: admissionNumber,
          roll_number: rollNumber,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: generateDOB(classLevel),
          gender: gender,
          blood_group: randomItem(bloodGroups),
          nationality: 'Indian',
          religion: randomItem(religions),
          category: randomItem(categories),
          aadhar_number: generateAadhaar(),
          email: generateEmail(firstName, lastName),
          phone: generatePhone(),
          address: `${Math.floor(Math.random() * 999) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
          city: randomItem(cities),
          state: 'Delhi',
          pincode: String(Math.floor(Math.random() * 900000) + 100000),
          class: classLevel,
          section: section,
          academic_year: academicYear,
          admission_date: `2025-04-${String(Math.floor(Math.random() * 15) + 1).padStart(2, '0')}`,
          status: 'active',
          parent1_name: `${randomItem(firstNames.male)} ${lastName}`,
          parent1_relation: 'Father',
          parent1_phone: generatePhone(),
          parent1_email: `parent.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
          parent1_occupation: randomItem(['Engineer', 'Doctor', 'Teacher', 'Businessman', 'Government Employee', 'Lawyer']),
          parent1_annual_income: Math.floor(Math.random() * 1500000) + 300000,
          parent2_name: `${randomItem(firstNames.female)} ${lastName}`,
          parent2_relation: 'Mother',
          parent2_phone: generatePhone(),
          parent2_occupation: randomItem(['Teacher', 'Doctor', 'Homemaker', 'Banker', 'Professor', 'CA']),
          parent2_annual_income: Math.floor(Math.random() * 1000000) + 200000,
          emergency_contact_name: `${randomItem(firstNames.male)} ${randomItem(lastNames)}`,
          emergency_contact_phone: generatePhone(),
          emergency_contact_relation: randomItem(['Uncle', 'Aunt', 'Grandfather', 'Grandmother']),
          previous_school: i % 3 === 0 ? `${randomItem(['Delhi Public', 'Ryan International', 'Kendriya Vidyalaya', 'St. Xavier'])} School` : null,
          created_by: adminId
        };
        
        await pool.query(
          `INSERT INTO students (
            admission_number, roll_number, first_name, last_name, date_of_birth,
            gender, blood_group, nationality, religion, category, aadhar_number,
            email, phone, address, city, state, pincode,
            class, section, academic_year, admission_date, status,
            parent1_name, parent1_relation, parent1_phone, parent1_email, parent1_occupation, parent1_annual_income,
            parent2_name, parent2_relation, parent2_phone, parent2_occupation, parent2_annual_income,
            emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
            previous_school, created_by
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
            $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
            $33, $34, $35, $36, $37, $38
          )`,
          [
            student.admission_number, student.roll_number, student.first_name, student.last_name, student.date_of_birth,
            student.gender, student.blood_group, student.nationality, student.religion, student.category, student.aadhar_number,
            student.email, student.phone, student.address, student.city, student.state, student.pincode,
            student.class, student.section, student.academic_year, student.admission_date, student.status,
            student.parent1_name, student.parent1_relation, student.parent1_phone, student.parent1_email, student.parent1_occupation, student.parent1_annual_income,
            student.parent2_name, student.parent2_relation, student.parent2_phone, student.parent2_occupation, student.parent2_annual_income,
            student.emergency_contact_name, student.emergency_contact_phone, student.emergency_contact_relation,
            student.previous_school, student.created_by
          ]
        );
      }
    }
    
    console.log(`✅ Successfully created ${studentCount} students across ${classes.length} classes`);
    
    // Show summary
    const summary = await pool.query(
      `SELECT class, section, COUNT(*) as count 
       FROM students 
       GROUP BY class, section 
       ORDER BY class, section`
    );
    
    console.log('\n📊 Students by Class & Section:');
    summary.rows.forEach(row => {
      console.log(`  ${row.class}-${row.section}: ${row.count} students`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding students:', error);
    process.exit(1);
  }
}

seedStudents();

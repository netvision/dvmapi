// Test Student Management API
// Run with: node test-students.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';
let authToken = '';

// Helper function for API calls
const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

async function login() {
  console.log('\n📝 Logging in as admin...');
  const response = await api.post('/core/auth/login', {
    email: 'admin@institute.com',
    password: 'admin123'
  });
  authToken = response.data.data.accessToken;
  console.log('✅ Login successful');
}

async function createStudent() {
  console.log('\n📝 Creating a new student...');
  const studentData = {
    admission_number: 'STU2026001',
    roll_number: '101',
    first_name: 'Rahul',
    middle_name: 'Kumar',
    last_name: 'Sharma',
    date_of_birth: '2010-05-15',
    gender: 'male',
    blood_group: 'O+',
    nationality: 'Indian',
    religion: 'Hindu',
    category: 'general',
    email: 'rahul.sharma@example.com',
    phone: '9876543210',
    address: '123 Main Street',
    city: 'Delhi',
    state: 'Delhi',
    pincode: '110001',
    class: '10',
    section: 'A',
    academic_year: '2025-2026',
    admission_date: '2025-04-01',
    status: 'active',
    parent1_name: 'Rajesh Sharma',
    parent1_relation: 'Father',
    parent1_phone: '9876543211',
    parent1_email: 'rajesh.sharma@example.com',
    parent1_occupation: 'Engineer',
    parent1_annual_income: 1200000,
    parent2_name: 'Priya Sharma',
    parent2_relation: 'Mother',
    parent2_phone: '9876543212',
    parent2_email: 'priya.sharma@example.com',
    parent2_occupation: 'Teacher',
    parent2_annual_income: 800000,
    emergency_contact_name: 'Amit Sharma',
    emergency_contact_phone: '9876543213',
    emergency_contact_relation: 'Uncle',
    medical_conditions: 'None',
    allergies: 'Peanuts',
    previous_school: 'ABC Public School'
  };

  try {
    const response = await api.post('/students', studentData);
    console.log('✅ Student created successfully:');
    console.log(`   ID: ${response.data.data.student.id}`);
    console.log(`   Name: ${response.data.data.student.first_name} ${response.data.data.student.last_name}`);
    console.log(`   Admission Number: ${response.data.data.student.admission_number}`);
    return response.data.data.student;
  } catch (error) {
    console.error('❌ Error creating student:', error.response?.data?.message || error.message);
  }
}

async function getAllStudents() {
  console.log('\n📝 Getting all students...');
  try {
    const response = await api.get('/students?page=1&limit=10&status=active');
    console.log(`✅ Found ${response.data.data.students.length} students`);
    console.log(`   Total students: ${response.data.data.pagination.totalStudents}`);
    response.data.data.students.forEach((student, index) => {
      console.log(`   ${index + 1}. ${student.first_name} ${student.last_name} (${student.admission_number}) - Class ${student.class}${student.section}`);
    });
    return response.data.data.students;
  } catch (error) {
    console.error('❌ Error getting students:', error.response?.data?.message || error.message);
  }
}

async function getStudentById(id) {
  console.log(`\n📝 Getting student by ID: ${id}...`);
  try {
    const response = await api.get(`/students/${id}`);
    const student = response.data.data.student;
    console.log('✅ Student details:');
    console.log(`   Name: ${student.first_name} ${student.middle_name || ''} ${student.last_name}`);
    console.log(`   Admission Number: ${student.admission_number}`);
    console.log(`   Class: ${student.class}${student.section}`);
    console.log(`   Parent: ${student.parent1_name} (${student.parent1_phone})`);
    return student;
  } catch (error) {
    console.error('❌ Error getting student:', error.response?.data?.message || error.message);
  }
}

async function updateStudent(id) {
  console.log(`\n📝 Updating student ${id}...`);
  try {
    const response = await api.put(`/students/${id}`, {
      roll_number: '102',
      phone: '9876543299'
    });
    console.log('✅ Student updated successfully');
    console.log(`   New roll number: ${response.data.data.student.roll_number}`);
    console.log(`   New phone: ${response.data.data.student.phone}`);
  } catch (error) {
    console.error('❌ Error updating student:', error.response?.data?.message || error.message);
  }
}

async function getStatistics() {
  console.log('\n📝 Getting student statistics...');
  try {
    const response = await api.get('/students/statistics?academic_year=2025-2026');
    console.log('✅ Statistics:');
    console.log(`   Active students: ${response.data.data.overview.active_students}`);
    console.log(`   Male students: ${response.data.data.overview.male_students}`);
    console.log(`   Female students: ${response.data.data.overview.female_students}`);
    console.log(`   Total classes: ${response.data.data.overview.total_classes}`);
    console.log('\n   Class-wise breakdown:');
    response.data.data.classSummary.forEach(cls => {
      console.log(`   - Class ${cls.class}${cls.section}: ${cls.student_count} students (M: ${cls.male_count}, F: ${cls.female_count})`);
    });
  } catch (error) {
    console.error('❌ Error getting statistics:', error.response?.data?.message || error.message);
  }
}

// Run all tests
async function runTests() {
  try {
    console.log('🧪 Testing Student Management API\n');
    console.log('='.repeat(50));
    
    await login();
    const student = await createStudent();
    
    if (student) {
      await getAllStudents();
      await getStudentById(student.id);
      await updateStudent(student.id);
      await getStatistics();
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ All tests completed!');
    console.log('\n💡 Check Swagger docs at: http://localhost:5000/api-docs');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTests();

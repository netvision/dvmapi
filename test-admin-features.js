// Test admin user management features
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/v1';
let adminToken = '';
let teacherId = '';

async function login() {
  console.log('1. Logging in as admin...');
  const response = await fetch(`${API_URL}/core/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@institute.com',
      password: 'admin123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    adminToken = data.data.accessToken;
    console.log('✓ Login successful');
  } else {
    console.log('✗ Login failed:', data);
  }
}

async function getUsers() {
  console.log('\n2. Getting all users...');
  const response = await fetch(`${API_URL}/core/users`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log(`✓ Found ${data.data.length} users`);
    const teacher = data.data.find(u => u.role === 'teacher');
    if (teacher) {
      teacherId = teacher.id;
      console.log(`  Teacher ID: ${teacherId}, Email: ${teacher.email}, Active: ${teacher.is_active}`);
    }
  } else {
    console.log('✗ Failed to get users:', data);
  }
}

async function resetPassword() {
  console.log('\n3. Testing password reset...');
  const response = await fetch(`${API_URL}/core/users/${teacherId}/reset-password`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      newPassword: 'newteacher123'
    })
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✓ Password reset successful');
    console.log(`  Message: ${data.message}`);
  } else {
    console.log('✗ Password reset failed:', data);
  }
}

async function toggleStatus() {
  console.log('\n4. Testing suspend/activate toggle...');
  const response = await fetch(`${API_URL}/core/users/${teacherId}/toggle-status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✓ Status toggled successfully');
    console.log(`  Message: ${data.message}`);
    console.log(`  New status: ${data.data.is_active ? 'Active' : 'Suspended'}`);
  } else {
    console.log('✗ Status toggle failed:', data);
  }
}

async function toggleStatusAgain() {
  console.log('\n5. Toggling status back...');
  const response = await fetch(`${API_URL}/core/users/${teacherId}/toggle-status`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✓ Status toggled back successfully');
    console.log(`  New status: ${data.data.is_active ? 'Active' : 'Suspended'}`);
  } else {
    console.log('✗ Status toggle failed:', data);
  }
}

async function runTests() {
  try {
    await login();
    await getUsers();
    await resetPassword();
    await toggleStatus();
    await toggleStatusAgain();
    
    console.log('\n✓ All tests completed!');
  } catch (error) {
    console.error('Error during tests:', error);
  }
}

runTests();

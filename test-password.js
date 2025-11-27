import dotenv from 'dotenv';
dotenv.config();
import { connectDatabase, query } from './src/database/connection.js';
import bcrypt from 'bcryptjs';

async function test() {
  await connectDatabase();
  const result = await query('SELECT password FROM users WHERE email = $1', ['admin@institute.com']);
  
  if (result.rows.length === 0) {
    console.log('User not found!');
    process.exit(1);
  }
  
  const hash = result.rows[0].password;
  console.log('Hash from DB:', hash);
  
  const match = await bcrypt.compare('admin123', hash);
  console.log('Password matches "admin123":', match);
  
  process.exit(0);
}

test().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

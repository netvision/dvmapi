import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const sql = fs.readFileSync('src/database/migrations/004-create-staff-tables.sql', 'utf8');

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.query(sql)
  .then(() => {
    console.log('✅ Staff tables created successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

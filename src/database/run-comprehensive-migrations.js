import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runMigration(filename) {
  const filePath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`\n📝 Running migration: ${filename}`);
  
  try {
    await pool.query(sql);
    console.log(`✅ Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`❌ Error in migration ${filename}:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('=' .repeat(80));
  console.log('RUNNING COMPREHENSIVE SCHEMA ENHANCEMENTS');
  console.log('='.repeat(80));

  try {
    // Run the new comprehensive migrations
    await runMigration('005-enhance-students-comprehensive.sql');
    await runMigration('006-enhance-staff-comprehensive.sql');
    await runMigration('007-enhance-classes-sections.sql');
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL MIGRATIONS COMPLETED SUCCESSFULLY');
    console.log('='.repeat(80));
    console.log('\n📊 Database schema now supports:');
    console.log('  - 150+ student fields including siblings, transport, documents');
    console.log('  - 80+ staff fields including experience, qualifications, family');
    console.log('  - Enhanced classes and sections with wings, teachers, counts');
    console.log('  - New tables: student_siblings, transport_routes, fee_categories');
    console.log('  - New tables: staff_qualifications_detailed, staff_experience');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

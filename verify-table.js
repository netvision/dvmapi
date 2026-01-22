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
  const res = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students'"
  );
  
  console.log('✅ Students table exists:', res.rows.length > 0);
  if (res.rows.length > 0) {
    console.log('Table name:', res.rows[0].table_name);
    
    // Get column count
    const cols = await pool.query(
      "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'students'"
    );
    console.log('Column count:', cols.rows[0].count);
  }
  
  await pool.end();
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}

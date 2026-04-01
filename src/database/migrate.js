import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import { getPool } from './connection.js';
import logger from '../shared/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const runMigrations = async () => {
  try {
    const pool = getPool();

    logger.info('Running database migrations...');

    // 1. Run schema.sql (idempotent base schema)
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);

    // 2. Run individual migration files in order
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const applied = await pool.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file]
      );
      if (applied.rows.length > 0) {
        logger.info(`  skipped (already applied): ${file}`);
        continue;
      }
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      logger.info(`  ✓ applied: ${file}`);
    }

    logger.info('✓ Database migrations completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

// Run if called directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule || process.argv[1]?.includes('migrate.js')) {
  console.log('Starting migration...');
  (async () => {
    try {
      const { connectDatabase } = await import('./connection.js');
      console.log('Connecting to database...');
      await connectDatabase();
      console.log('Running migrations...');
      await runMigrations();
      console.log('Migration completed!');
      process.exit(0);
    } catch (error) {
      console.error('Migration script failed:', error);
      logger.error('Migration script failed:', error);
      process.exit(1);
    }
  })();
}

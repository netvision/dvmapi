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
    const schemaPath = path.join(__dirname, 'schema.sql');
    
    logger.info('Running database migrations...');
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schemaSql);
    
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

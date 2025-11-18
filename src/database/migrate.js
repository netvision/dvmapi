import { getPool } from './connection.js';
import logger from '../shared/utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Explicitly load .env file
dotenv.config();

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
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const { connectDatabase } = await import('./connection.js');
      await connectDatabase();
      await runMigrations();
      process.exit(0);
    } catch (error) {
      logger.error('Migration script failed:', error);
      process.exit(1);
    }
  })();
}

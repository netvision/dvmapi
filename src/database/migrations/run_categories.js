import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import { query } from '../connection.js';
import logger from '../../shared/utils/logger.js';

const runMigration = async () => {
  try {
    logger.info('Running categories and galleries migration...');
    
    const sql = fs.readFileSync('./src/database/migrations/add_categories_galleries.sql', 'utf8');
    await query(sql);
    
    logger.info('✓ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

import('../connection.js').then(async ({ connectDatabase }) => {
  await connectDatabase();
  await runMigration();
});

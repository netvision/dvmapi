import dotenv from 'dotenv';
dotenv.config();

import { query, connectDatabase } from '../connection.js';
import logger from '../../shared/utils/logger.js';

export const addAchieversTable = async () => {
  try {
    logger.info('Creating achievers table...');

    // Create achievers table
    await query(`
      CREATE TABLE IF NOT EXISTS achievers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        photo_url VARCHAR(500),
        achievement TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.info('✓ Achievers table created successfully');

  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  (async () => {
    try {
      await connectDatabase();
      await addAchieversTable();
      process.exit(0);
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  })();
}

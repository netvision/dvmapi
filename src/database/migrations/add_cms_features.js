import dotenv from 'dotenv';
dotenv.config();

import { connectDatabase, getPool } from '../connection.js';
import logger from '../../shared/utils/logger.js';

const runIncrementalMigration = async () => {
  try {
    await connectDatabase();
    const pool = getPool();
    
    logger.info('Running incremental migrations for CMS updates...');
    
    // Migration SQL - only new tables/columns
    const migrationSQL = `
      -- Create news_categories table if not exists
      CREATE TABLE IF NOT EXISTS news_categories (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create news_gallery table if not exists
      CREATE TABLE IF NOT EXISTS news_gallery (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create events_gallery table if not exists
      CREATE TABLE IF NOT EXISTS events_gallery (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        caption TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Add category_id to news table if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='news' AND column_name='category_id'
        ) THEN
          ALTER TABLE news ADD COLUMN category_id VARCHAR(255);
        END IF;
      END $$;

      -- Add category_id to events table if not exists
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='events' AND column_name='category_id'
        ) THEN
          ALTER TABLE events ADD COLUMN category_id VARCHAR(255);
        END IF;
      END $$;

      -- Create indexes if not exists
      CREATE INDEX IF NOT EXISTS idx_news_category ON news(category_id);
      CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
      CREATE INDEX IF NOT EXISTS idx_news_gallery_news_id ON news_gallery(news_id);
      CREATE INDEX IF NOT EXISTS idx_events_gallery_event_id ON events_gallery(event_id);
    `;
    
    await pool.query(migrationSQL);
    
    logger.info('✓ Incremental migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
};

runIncrementalMigration();

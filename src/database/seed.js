import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports
dotenv.config();

import bcrypt from 'bcryptjs';
import { query } from './connection.js';
import logger from '../shared/utils/logger.js';

export const seedDatabase = async () => {
  try {
    logger.info('Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET 
         password = EXCLUDED.password,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         role = EXCLUDED.role,
         is_active = EXCLUDED.is_active`,
      ['admin@institute.com', hashedPassword, 'Admin', 'User', 'admin', true]
    );

    // Create sample users
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    await query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET 
         password = EXCLUDED.password,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         role = EXCLUDED.role,
         is_active = EXCLUDED.is_active`,
      ['teacher@institute.com', teacherPassword, 'John', 'Teacher', 'teacher', true]
    );

    const studentPassword = await bcrypt.hash('student123', 10);
    await query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET 
         password = EXCLUDED.password,
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         role = EXCLUDED.role,
         is_active = EXCLUDED.is_active`,
      ['student@institute.com', studentPassword, 'Jane', 'Student', 'student', true]
    );

    // Create news categories
    const categories = [
      { name: 'School News', slug: 'school-news', description: 'General school announcements and updates' },
      { name: 'Public Circular', slug: 'public-circular', description: 'Official circulars and notices' },
      { name: 'News Media', slug: 'news-media', description: 'Press releases and media coverage' },
      { name: 'Achievements', slug: 'achievements', description: 'Student and school achievements' },
      { name: 'Academic Updates', slug: 'academic-updates', description: 'Academic calendar and updates' },
      { name: 'Events', slug: 'events', description: 'Upcoming and past events' }
    ];

    for (const category of categories) {
      await query(
        `INSERT INTO news_categories (name, slug, description)
         VALUES ($1, $2, $3)
         ON CONFLICT (slug) DO NOTHING`,
        [category.name, category.slug, category.description]
      );
    }

    logger.info('✓ Database seeded successfully');
    logger.info('Default users created:');
    logger.info('  - admin@institute.com / admin123 (admin)');
    logger.info('  - teacher@institute.com / teacher123 (teacher)');
    logger.info('  - student@institute.com / student123 (student)');
    logger.info('Default news categories created:');
    logger.info('  - School News, Public Circular, News Media, Achievements, Academic Updates, Events');

  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
};

// Run if called directly
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule || process.argv[1]?.includes('seed.js')) {
  console.log('Starting database seed...');
  (async () => {
    try {
      const { connectDatabase } = await import('./connection.js');
      console.log('Connecting to database...');
      await connectDatabase();
      console.log('Seeding database...');
      await seedDatabase();
      console.log('Seed completed!');
      process.exit(0);
    } catch (error) {
      console.error('Seed script failed:', error);
      logger.error('Seed script failed:', error);
      process.exit(1);
    }
  })();
}

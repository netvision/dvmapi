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
       ON CONFLICT (email) DO NOTHING`,
      ['admin@institute.com', hashedPassword, 'Admin', 'User', 'admin', true]
    );

    // Create sample users
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    await query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['teacher@institute.com', teacherPassword, 'John', 'Teacher', 'teacher', true]
    );

    const studentPassword = await bcrypt.hash('student123', 10);
    await query(
      `INSERT INTO users (email, password, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['student@institute.com', studentPassword, 'Jane', 'Student', 'student', true]
    );

    logger.info('✓ Database seeded successfully');
    logger.info('Default users created:');
    logger.info('  - admin@institute.com / admin123 (admin)');
    logger.info('  - teacher@institute.com / teacher123 (teacher)');
    logger.info('  - student@institute.com / student123 (student)');

  } catch (error) {
    logger.error('Seeding failed:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const { connectDatabase } = await import('./connection.js');
      await connectDatabase();
      await seedDatabase();
      process.exit(0);
    } catch (error) {
      logger.error('Seed script failed:', error);
      process.exit(1);
    }
  })();
}

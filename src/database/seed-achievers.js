import dotenv from 'dotenv';
dotenv.config();

import { query, connectDatabase } from './connection.js';
import logger from '../shared/utils/logger.js';
import fs from 'fs/promises';

const seedAchievers = async () => {
  try {
    logger.info('Seeding achievers...');

    // Read the extracted data
    const data = JSON.parse(await fs.readFile('extracted_achievers.json', 'utf-8'));

    const achieversData = [
      {
        name: 'Akshra & Ishita Choudhary',
        photo_url: '/uploads/achievers/slide_3_img_2.png',
        achievement: 'Academic Excellence - Class X Toppers',
        category: 'Academic',
        year: 2025,
        display_order: 1
      },
      {
        name: 'Nishita',
        photo_url: '/uploads/achievers/slide_4_img_2.png',
        achievement: 'Academic Excellence - Class XII Science Topper',
        category: 'Academic',
        year: 2025,
        display_order: 2
      },
      {
        name: 'Komal Jangir',
        photo_url: '/uploads/achievers/slide_5_img_2.png',
        achievement: 'Academic Excellence - Class XII Commerce Topper',
        category: 'Academic',
        year: 2025,
        display_order: 3
      },
      {
        name: 'Keshav Sharma',
        photo_url: '/uploads/achievers/slide_6_img_1.png',
        achievement: 'Academic Excellence - Class XII Humanities Topper',
        category: 'Academic',
        year: 2025,
        display_order: 4
      },
      {
        name: 'Football Team U-14 Boys',
        photo_url: '/uploads/achievers/slide_8_img_2.png',
        achievement: 'CBSE Cluster Gold Medal & SGFI District Gold Medal, State Silver Medal',
        category: 'Sports',
        year: 2025,
        display_order: 5
      },
      {
        name: 'Bhumi Verma',
        photo_url: '/uploads/achievers/slide_10_img_1.jpg',
        achievement: 'SGFI District Silver Medal - Badminton U-14 Girls',
        category: 'Sports',
        year: 2025,
        display_order: 6
      },
      {
        name: 'Deepal',
        photo_url: '/uploads/achievers/slide_10_img_2.jpg',
        achievement: 'SGFI District Silver Medal - Badminton U-19 Girls',
        category: 'Sports',
        year: 2025,
        display_order: 7
      },
      {
        name: 'Hockey Team U-14 & U-17 Girls',
        photo_url: '/uploads/achievers/slide_11_img_2.png',
        achievement: 'CBSE West Zone Silver Medal, SGFI District Gold & Silver Medal',
        category: 'Sports',
        year: 2025,
        display_order: 8
      },
      {
        name: 'Sachin Pachar',
        photo_url: '/uploads/achievers/slide_14_img_1.jpg',
        achievement: 'National Player - SGFI State Gold Medal, District Silver Medal - Shooting U-17',
        category: 'Sports',
        year: 2025,
        display_order: 9
      },
      {
        name: 'Dhananjay Bharia',
        photo_url: '/uploads/achievers/slide_14_img_2.jpg',
        achievement: 'CBSE West Zone Bronze Medal, SGFI District Bronze Medal - Shooting U-17',
        category: 'Sports',
        year: 2025,
        display_order: 10
      }
    ];

    for (const achiever of achieversData) {
      await query(
        `INSERT INTO achievers (name, photo_url, achievement, category, year, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT DO NOTHING`,
        [achiever.name, achiever.photo_url, achiever.achievement, achiever.category, achiever.year, achiever.display_order]
      );
    }

    logger.info(`✓ Seeded ${achieversData.length} achievers successfully`);

  } catch (error) {
    logger.error('Seeding achievers failed:', error);
    throw error;
  }
};

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  (async () => {
    try {
      await connectDatabase();
      await seedAchievers();
      process.exit(0);
    } catch (error) {
      console.error('Seed failed:', error);
      process.exit(1);
    }
  })();
}

export { seedAchievers };

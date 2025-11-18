import express from 'express';
import { authenticate, authorize, optionalAuth } from '../../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Content Management System endpoints
 */

/**
 * @swagger
 * /cms/news:
 *   get:
 *     summary: Get all news
 *     tags: [CMS]
 */
router.get('/news', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'CMS module - Get all news (to be implemented)',
    data: [],
  });
});

/**
 * @swagger
 * /cms/news:
 *   post:
 *     summary: Create news
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 */
router.post('/news', authenticate, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'CMS module - Create news (to be implemented)',
  });
});

/**
 * @swagger
 * /cms/events:
 *   get:
 *     summary: Get all events
 *     tags: [CMS]
 */
router.get('/events', optionalAuth, (req, res) => {
  res.json({
    success: true,
    message: 'CMS module - Get all events (to be implemented)',
    data: [],
  });
});

/**
 * @swagger
 * /cms/events:
 *   post:
 *     summary: Create event
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 */
router.post('/events', authenticate, authorize('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'CMS module - Create event (to be implemented)',
  });
});

export default router;

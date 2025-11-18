import express from 'express';
import { authenticate } from '../../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Learning
 *   description: AI Learning module endpoints
 */

/**
 * @swagger
 * /learning/chat:
 *   post:
 *     summary: Chat with AI assistant
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 */
router.post('/chat', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'AI Learning module - Chat (to be implemented)',
  });
});

/**
 * @swagger
 * /learning/syllabus:
 *   get:
 *     summary: Get syllabi
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 */
router.get('/syllabus', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'AI Learning module - Get syllabi (to be implemented)',
    data: [],
  });
});

/**
 * @swagger
 * /learning/content:
 *   get:
 *     summary: Get learning content
 *     tags: [Learning]
 *     security:
 *       - bearerAuth: []
 */
router.get('/content', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'AI Learning module - Get content (to be implemented)',
    data: [],
  });
});

export default router;

import express from 'express';
import { authenticate, authorize } from '../../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Library
 *   description: Library management endpoints
 */

/**
 * @swagger
 * /library/books:
 *   get:
 *     summary: Get all books
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 */
router.get('/books', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'Library module - Get all books',
    data: [],
  });
});

/**
 * @swagger
 * /library/books:
 *   post:
 *     summary: Add new book
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 */
router.post('/books', authenticate, authorize('admin', 'librarian'), (req, res) => {
  res.json({
    success: true,
    message: 'Library module - Add book (to be implemented)',
  });
});

// Add more library routes here (circulation, catalog, etc.)

export default router;

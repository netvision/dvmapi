import express from 'express';
import { authenticate, authorize, optionalAuth } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validator.js';
import { newsController } from '../controllers/newsController.js';
import { eventsController } from '../controllers/eventsController.js';
import { categoryController } from '../controllers/categoryController.js';
import { achieversController } from '../controllers/achieversController.js';
import { contactController } from '../controllers/contactController.js';
import { newsSchemas, eventsSchemas } from '../validators/cmsValidators.js';
import { achieversSchemas } from '../validators/achieversValidators.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: Content Management System endpoints
 */

// ============================================================================
// NEWS ROUTES
// ============================================================================

/**
 * @swagger
 * /cms/news:
 *   get:
 *     summary: Get all news articles
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of news articles
 */
router.get('/news', optionalAuth, newsController.getAllNews);

/**
 * @swagger
 * /cms/news/{slug}:
 *   get:
 *     summary: Get news article by slug
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article details
 */
router.get('/news/:slug', optionalAuth, newsController.getNewsBySlug);

/**
 * @swagger
 * /cms/news:
 *   post:
 *     summary: Create news article
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               content:
 *                 type: string
 *               featured_image_url:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       201:
 *         description: News article created
 */
router.post('/news', authenticate, authorize('admin'), validate(newsSchemas.createNews), newsController.createNews);

/**
 * @swagger
 * /cms/news/{id}:
 *   put:
 *     summary: Update news article
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article updated
 */
router.put('/news/:id', authenticate, authorize('admin'), validate(newsSchemas.updateNews), newsController.updateNews);

/**
 * @swagger
 * /cms/news/{id}:
 *   delete:
 *     summary: Delete news article
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: News article deleted
 */
router.delete('/news/:id', authenticate, authorize('admin'), newsController.deleteNews);

// ============================================================================
// EVENTS ROUTES
// ============================================================================

/**
 * @swagger
 * /cms/events:
 *   get:
 *     summary: Get all events
 *     tags: [CMS]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of events
 */
router.get('/events', optionalAuth, eventsController.getAllEvents);

/**
 * @swagger
 * /cms/events/{slug}:
 *   get:
 *     summary: Get event by slug
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 */
router.get('/events/:slug', optionalAuth, eventsController.getEventBySlug);

/**
 * @swagger
 * /cms/events:
 *   post:
 *     summary: Create event
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - start_date
 *               - end_date
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               featured_image_url:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, cancelled]
 *     responses:
 *       201:
 *         description: Event created
 */
router.post('/events', authenticate, authorize('admin'), validate(eventsSchemas.createEvent), eventsController.createEvent);

/**
 * @swagger
 * /cms/events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated
 */
router.put('/events/:id', authenticate, authorize('admin'), validate(eventsSchemas.updateEvent), eventsController.updateEvent);

/**
 * @swagger
 * /cms/events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted
 */
router.delete('/events/:id', authenticate, authorize('admin'), eventsController.deleteEvent);

// ============================================================================
// CATEGORY ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/cms/categories
 * @desc    Get all news categories
 * @access  Public
 */
router.get('/categories', categoryController.getAllCategories);

/**
 * @route   POST /api/v1/cms/categories
 * @desc    Create a new category
 * @access  Admin
 */
router.post('/categories', authenticate, authorize('admin'), categoryController.createCategory);

// ============================================================================
// ACHIEVERS ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/cms/achievers
 * @desc    Get all achievers
 * @access  Public
 */
router.get('/achievers', achieversController.getAchievers);

/**
 * @route   GET /api/v1/cms/achievers/:id
 * @desc    Get single achiever
 * @access  Public
 */
router.get('/achievers/:id', achieversController.getAchiever);

/**
 * @route   POST /api/v1/cms/achievers
 * @desc    Create a new achiever
 * @access  Admin
 */
router.post('/achievers', authenticate, authorize('admin'), validate(achieversSchemas.createAchiever), achieversController.createAchiever);

/**
 * @route   PUT /api/v1/cms/achievers/:id
 * @desc    Update an achiever
 * @access  Admin
 */
router.put('/achievers/:id', authenticate, authorize('admin'), validate(achieversSchemas.updateAchiever), achieversController.updateAchiever);

/**
 * @route   DELETE /api/v1/cms/achievers/:id
 * @desc    Delete an achiever
 * @access  Admin
 */
router.delete('/achievers/:id', authenticate, authorize('admin'), achieversController.deleteAchiever);

// ============================================================================
// CONTACT ROUTES
// ============================================================================

/**
 * @route   POST /api/v1/cms/contact
 * @desc    Submit contact form
 * @access  Public
 */
router.post('/contact', contactController.submitContact);

/**
 * @route   GET /api/v1/cms/contact
 * @desc    Get all contact messages
 * @access  Admin
 */
router.get('/contact', authenticate, authorize('admin'), contactController.getAllMessages);

/**
 * @route   GET /api/v1/cms/contact/:id
 * @desc    Get single contact message
 * @access  Admin
 */
router.get('/contact/:id', authenticate, authorize('admin'), contactController.getMessage);

/**
 * @route   PATCH /api/v1/cms/contact/:id/status
 * @desc    Update message status
 * @access  Admin
 */
router.patch('/contact/:id/status', authenticate, authorize('admin'), contactController.updateStatus);

/**
 * @route   DELETE /api/v1/cms/contact/:id
 * @desc    Delete contact message
 * @access  Admin
 */
router.delete('/contact/:id', authenticate, authorize('admin'), contactController.deleteMessage);

export default router;

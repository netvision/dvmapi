import express from 'express';
import { authController } from '../controllers/authController.js';
import { userController } from '../controllers/userController.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validator.js';
import { authSchemas, userSchemas } from '../validators/authValidators.js';

const router = express.Router();

/**
 * @swagger
 * /core/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/auth/register', validate(authSchemas.register), authController.register);

/**
 * @swagger
 * /core/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/auth/login', validate(authSchemas.login), authController.login);

/**
 * @swagger
 * /core/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 */
router.post('/auth/refresh', validate(authSchemas.refreshToken), authController.refreshToken);

/**
 * @swagger
 * /core/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.get('/auth/profile', authenticate, authController.getProfile);

/**
 * @swagger
 * /core/auth/profile:
 *   put:
 *     summary: Update current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.put('/auth/profile', authenticate, validate(authSchemas.updateProfile), authController.updateProfile);

/**
 * @swagger
 * /core/auth/change-password:
 *   post:
 *     summary: Change password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.post('/auth/change-password', authenticate, validate(authSchemas.changePassword), authController.changePassword);

// User Management Routes (Admin only)
/**
 * @swagger
 * /core/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users', authenticate, authorize('admin'), userController.getAllUsers);

/**
 * @swagger
 * /core/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/users/:id', authenticate, authorize('admin'), userController.getUserById);

/**
 * @swagger
 * /core/users/{id}:
 *   put:
 *     summary: Update user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/users/:id', authenticate, authorize('admin'), validate(userSchemas.updateUser), userController.updateUser);

/**
 * @swagger
 * /core/users/{id}:
 *   delete:
 *     summary: Delete user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/users/:id', authenticate, authorize('admin'), userController.deleteUser);

export default router;

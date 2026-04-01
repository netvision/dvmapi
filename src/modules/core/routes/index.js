import express from 'express';
import { authController } from '../controllers/authController.js';
import { userController } from '../controllers/userController.js';
import { uploadController } from '../controllers/uploadController.js';
import { rolesController } from '../controllers/rolesController.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validator.js';
import { authSchemas, userSchemas, roleSchemas } from '../validators/authValidators.js';

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
router.get('/users', authenticate, authorize('admin', 'superadmin'), userController.getAllUsers);
router.post('/users', authenticate, authorize('admin', 'superadmin'), userController.createUser);
router.get('/users/:id', authenticate, authorize('admin', 'superadmin'), userController.getUserById);
router.put('/users/:id', authenticate, authorize('admin', 'superadmin'), validate(userSchemas.updateUser), userController.updateUser);
router.delete('/users/:id', authenticate, authorize('admin', 'superadmin'), userController.deleteUser);
router.post('/users/:id/reset-password', authenticate, authorize('admin', 'superadmin'), userController.resetUserPassword);
router.patch('/users/:id/toggle-status', authenticate, authorize('admin', 'superadmin'), userController.toggleUserStatus);

// Roles Management Routes
router.get('/roles', authenticate, authorize('admin', 'superadmin'), rolesController.getAllRoles);
router.post('/roles', authenticate, authorize('superadmin'), validate(roleSchemas.create), rolesController.createRole);
router.put('/roles/:id', authenticate, authorize('superadmin'), validate(roleSchemas.update), rolesController.updateRole);
router.delete('/roles/:id', authenticate, authorize('superadmin'), rolesController.deleteRole);

// Upload routes (authenticated users only)
/**
 * @route   POST /api/v1/core/upload/single
 * @desc    Upload single file
 * @access  Authenticated
 */
router.post('/upload/single', authenticate, ...uploadController.uploadSingle);

/**
 * @route   POST /api/v1/core/upload/multiple
 * @desc    Upload multiple files
 * @access  Authenticated
 */
router.post('/upload/multiple', authenticate, ...uploadController.uploadMultiple);

export default router;

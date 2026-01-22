import express from 'express';
import { staffController } from '../controllers/staffController.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validator.js';
import { staffValidators } from '../validators/staffValidators.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management (teaching & non-teaching)
 */

/**
 * @swagger
 * /api/v1/staff/statistics:
 *   get:
 *     summary: Get staff statistics
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff statistics retrieved successfully
 */
router.get('/statistics', authenticate, staffController.getStatistics);

/**
 * @swagger
 * /api/v1/staff:
 *   get:
 *     summary: Get all staff with pagination and filters
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: staff_type
 *         schema:
 *           type: string
 *           enum: [teaching, non-teaching, administrative, support]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, on-leave, suspended, resigned, retired]
 *     responses:
 *       200:
 *         description: Staff list retrieved successfully
 */
router.get(
  '/',
  authenticate,
  validate(staffValidators.query, 'query'),
  staffController.getAll
);

/**
 * @swagger
 * /api/v1/staff:
 *   post:
 *     summary: Create new staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Staff member created successfully
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validate(staffValidators.create),
  staffController.create
);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   get:
 *     summary: Get staff member by ID
 *     tags: [Staff]
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
 *         description: Staff member retrieved successfully
 */
router.get('/:id', authenticate, staffController.getById);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   put:
 *     summary: Update staff member
 *     tags: [Staff]
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
 *         description: Staff member updated successfully
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validate(staffValidators.update),
  staffController.update
);

/**
 * @swagger
 * /api/v1/staff/{id}:
 *   delete:
 *     summary: Delete (soft delete) staff member
 *     tags: [Staff]
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
 *         description: Staff member deleted successfully
 */
router.delete('/:id', authenticate, authorize('admin'), staffController.delete);

/**
 * @swagger
 * /api/v1/staff/employee/{employee_id}:
 *   get:
 *     summary: Get staff member by employee ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employee_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member retrieved successfully
 */
router.get('/employee/:employee_id', authenticate, staffController.getByEmployeeId);

/**
 * @swagger
 * /api/v1/staff/{id}/leave-balance:
 *   get:
 *     summary: Get staff member leave balance
 *     tags: [Staff]
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
 *         description: Leave balance retrieved successfully
 */
router.get('/:id/leave-balance', authenticate, staffController.getLeaveBalance);

/**
 * @swagger
 * /api/v1/staff/{id}/leaves:
 *   get:
 *     summary: Get staff member leaves
 *     tags: [Staff]
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
 *         description: Leaves retrieved successfully
 */
router.get('/:id/leaves', authenticate, staffController.getLeaves);

export default router;

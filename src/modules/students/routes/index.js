import express from 'express';
import { studentController } from '../controllers/studentController.js';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validator.js';
import { studentSchemas } from '../validators/studentValidators.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management endpoints
 */

/**
 * @swagger
 * /students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admission_number
 *               - first_name
 *               - last_name
 *               - date_of_birth
 *               - gender
 *               - class
 *               - academic_year
 *               - admission_date
 *               - parent1_name
 *               - parent1_relation
 *               - parent1_phone
 *             properties:
 *               admission_number:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               class:
 *                 type: string
 *               section:
 *                 type: string
 *               academic_year:
 *                 type: string
 *               admission_date:
 *                 type: string
 *                 format: date
 *               parent1_name:
 *                 type: string
 *               parent1_relation:
 *                 type: string
 *               parent1_phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student created successfully
 *       409:
 *         description: Admission number already exists
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  validate(studentSchemas.create),
  studentController.create
);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students with filtering and pagination
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *       - in: query
 *         name: section
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, alumni, transferred]
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
 */
router.get(
  '/',
  authenticate,
  authorize('admin', 'teacher'),
  validate(studentSchemas.query, 'query'),
  studentController.getAll
);

/**
 * @swagger
 * /students/statistics:
 *   get:
 *     summary: Get student statistics
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academic_year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get(
  '/statistics',
  authenticate,
  authorize('admin', 'teacher'),
  studentController.getStatistics
);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *       404:
 *         description: Student not found
 */
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  studentController.getById
);

/**
 * @swagger
 * /students/admission/{admission_number}:
 *   get:
 *     summary: Get student by admission number
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: admission_number
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *       404:
 *         description: Student not found
 */
router.get(
  '/admission/:admission_number',
  authenticate,
  authorize('admin', 'teacher'),
  studentController.getByAdmissionNumber
);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student information
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Student updated successfully
 *       404:
 *         description: Student not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  validate(studentSchemas.update),
  studentController.update
);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Deactivate student (soft delete)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student deactivated successfully
 *       404:
 *         description: Student not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'teacher'),
  studentController.delete
);

/**
 * @swagger
 * /students/{id}/permanent:
 *   delete:
 *     summary: Permanently delete student (admin only)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student permanently deleted
 *       404:
 *         description: Student not found
 */
router.delete(
  '/:id/permanent',
  authenticate,
  authorize('admin'),
  studentController.permanentDelete
);

export default router;

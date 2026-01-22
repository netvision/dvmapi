import express from 'express';
import { academicController } from '../controllers/academicController.js';
import { authenticate, authorize } from '../../../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Academics
 *   description: Academic structure management (CBSE pattern)
 */

/**
 * @swagger
 * /api/v1/academics/statistics:
 *   get:
 *     summary: Get academic structure statistics
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic statistics retrieved successfully
 */
router.get('/statistics', authenticate, academicController.getStatistics);

/**
 * @swagger
 * /api/v1/academics/years:
 *   get:
 *     summary: Get all academic years
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Academic years retrieved successfully
 */
router.get('/years', authenticate, academicController.getAllAcademicYears);

/**
 * @swagger
 * /api/v1/academics/years/current:
 *   get:
 *     summary: Get current academic year
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current academic year retrieved successfully
 */
router.get('/years/current', authenticate, academicController.getCurrentAcademicYear);

/**
 * @swagger
 * /api/v1/academics/classes:
 *   get:
 *     summary: Get all classes
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: academic_year_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [pre-primary, primary, middle, secondary, senior-secondary]
 *     responses:
 *       200:
 *         description: Classes retrieved successfully
 */
router.get('/classes', authenticate, academicController.getAllClasses);

/**
 * @swagger
 * /api/v1/academics/classes/{id}:
 *   get:
 *     summary: Get class details with sections and subjects
 *     tags: [Academics]
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
 *         description: Class details retrieved successfully
 */
router.get('/classes/:id', authenticate, academicController.getClassDetails);

/**
 * @swagger
 * /api/v1/academics/classes/{classId}/sections:
 *   get:
 *     summary: Get sections for a class
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sections retrieved successfully
 */
router.get('/classes/:classId/sections', authenticate, academicController.getClassSections);

/**
 * @swagger
 * /api/v1/academics/classes/{classId}/subjects:
 *   get:
 *     summary: Get subjects for a class
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Class subjects retrieved successfully
 */
router.get('/classes/:classId/subjects', authenticate, academicController.getClassSubjects);

/**
 * @swagger
 * /api/v1/academics/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [core, elective, language, vocational, co-curricular]
 *       - in: query
 *         name: practical
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Subjects retrieved successfully
 */
router.get('/subjects', authenticate, academicController.getAllSubjects);

/**
 * @swagger
 * /api/v1/academics/classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - display_name
 *               - level
 *               - sequence_order
 *             properties:
 *               name:
 *                 type: string
 *               display_name:
 *                 type: string
 *               level:
 *                 type: string
 *               sequence_order:
 *                 type: integer
 *               wing:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Class created successfully
 */
router.post('/classes', authenticate, authorize('admin'), academicController.createClass);

/**
 * @swagger
 * /api/v1/academics/classes/{id}:
 *   put:
 *     summary: Update a class
 *     tags: [Academics]
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
 *         description: Class updated successfully
 */
router.put('/classes/:id', authenticate, authorize('admin'), academicController.updateClass);

/**
 * @swagger
 * /api/v1/academics/classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     tags: [Academics]
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
 *         description: Class deleted successfully
 */
router.delete('/classes/:id', authenticate, authorize('admin'), academicController.deleteClass);

/**
 * @swagger
 * /api/v1/academics/sections:
 *   post:
 *     summary: Create a new section
 *     tags: [Academics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class_id
 *               - name
 *             properties:
 *               class_id:
 *                 type: string
 *               name:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               room_number:
 *                 type: string
 *               floor_number:
 *                 type: integer
 *               building_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Section created successfully
 */
router.post('/sections', authenticate, authorize('admin'), academicController.createSection);

/**
 * @swagger
 * /api/v1/academics/sections/{id}:
 *   put:
 *     summary: Update a section
 *     tags: [Academics]
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
 *         description: Section updated successfully
 */
router.put('/sections/:id', authenticate, authorize('admin'), academicController.updateSection);

/**
 * @swagger
 * /api/v1/academics/sections/{id}:
 *   delete:
 *     summary: Delete a section
 *     tags: [Academics]
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
 *         description: Section deleted successfully
 */
router.delete('/sections/:id', authenticate, authorize('admin'), academicController.deleteSection);

export default router;

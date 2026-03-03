import express from 'express';
import { authenticate, authorize } from '../../../middleware/auth.js';
import { validate } from '../../../middleware/validator.js';
import { learningController } from '../controllers/learningController.js';
import { learningSchemas } from '../validators/learningValidators.js';

const router = express.Router();

// ── Teacher Assignments ────────────────────────────────────────────────────
router.get('/assignment-options', authenticate, authorize('admin'), learningController.getAssignmentOptions);
router.get('/teacher-assignments', authenticate, authorize('admin'), learningController.getTeacherAssignments);
router.post('/teacher-assignments', authenticate, authorize('admin'), validate(learningSchemas.createTeacherAssignment), learningController.createTeacherAssignment);
router.delete('/teacher-assignments/:id', authenticate, authorize('admin'), learningController.deleteTeacherAssignment);

// ── Classes & Subjects ─────────────────────────────────────────────────────
router.get('/classes-subjects', authenticate, learningController.getClassesWithSubjects);

// ── Chapters ───────────────────────────────────────────────────────────────
router.get('/chapters', authenticate, learningController.getChapters);
router.post('/chapters', authenticate, authorize('admin'), validate(learningSchemas.createChapter), learningController.createChapter);
router.put('/chapters/:id', authenticate, authorize('admin', 'teacher'), validate(learningSchemas.updateChapter), learningController.updateChapter);
router.delete('/chapters/:id', authenticate, authorize('admin'), learningController.deleteChapter);

// ── Key Concepts ───────────────────────────────────────────────────────────
router.get('/key-concepts', authenticate, learningController.getKeyConcepts);
router.post('/key-concepts', authenticate, authorize('admin', 'teacher'), validate(learningSchemas.createKeyConcept), learningController.createKeyConcept);
router.put('/key-concepts/:id', authenticate, authorize('admin', 'teacher'), validate(learningSchemas.updateKeyConcept), learningController.updateKeyConcept);
router.delete('/key-concepts/:id', authenticate, authorize('admin', 'teacher'), learningController.deleteKeyConcept);

// ── Lesson Plans ───────────────────────────────────────────────────────────
router.get('/my-lesson-plans', authenticate, learningController.getMyLessonPlans);
router.delete('/lesson-plans/:id', authenticate, authorize('admin', 'teacher'), learningController.deleteLessonPlan);
router.get('/key-concepts/:keyConceptId/lesson-plan', authenticate, learningController.getLessonPlanByConcept);
router.put('/key-concepts/:keyConceptId/lesson-plan', authenticate, authorize('admin', 'teacher'), validate(learningSchemas.upsertLessonPlan), learningController.upsertLessonPlanForConcept);
router.post('/key-concepts/:keyConceptId/lesson-plan', authenticate, authorize('admin', 'teacher'), validate(learningSchemas.upsertLessonPlan), learningController.upsertLessonPlanForConcept);

// ── Hierarchy ──────────────────────────────────────────────────────────────
router.get('/hierarchy', authenticate, learningController.getHierarchy);

export default router;

import Joi from 'joi';

const uuidSchema = Joi.string().uuid();

const arrayOfStrings = Joi.array().items(Joi.string().trim()).default([]);

export const learningSchemas = {
  createTeacherAssignment: Joi.object({
    teacher_id: uuidSchema.required(),
    class_id: uuidSchema.required(),
    subject_id: uuidSchema.required(),
    section_id: uuidSchema.allow(null, ''),
    academic_year_id: uuidSchema.allow(null, ''),
  }),

  createChapter: Joi.object({
    class_id: uuidSchema.required(),
    subject_id: uuidSchema.required(),
    chapterNo: Joi.string().trim().max(50).required(),
    title: Joi.string().trim().min(2).max(255).required(),
    description: Joi.string().allow('', null),
    pdf_url: Joi.string().uri().allow('', null),
  }),

  updateChapter: Joi.object({
    chapterNo: Joi.string().trim().max(50),
    title: Joi.string().trim().min(2).max(255),
    description: Joi.string().allow('', null),
    pdf_url: Joi.string().uri().allow('', null),
  }).min(1),

  createKeyConcept: Joi.object({
    title: Joi.string().trim().min(2).max(255).required(),
    description: Joi.string().allow('', null),
    chapter_id: uuidSchema.required(),
    totalSessionsRequired: Joi.number().integer().positive().required(),
    sessionDurationMinutes: Joi.number().integer().positive().allow(null),
    difficultyLevel: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
    prerequisites: Joi.array().items(Joi.alternatives().try(uuidSchema, Joi.string().trim())).default([]),
  }),

  updateKeyConcept: Joi.object({
    title: Joi.string().trim().min(2).max(255),
    description: Joi.string().allow('', null),
    totalSessionsRequired: Joi.number().integer().positive(),
    sessionDurationMinutes: Joi.number().integer().positive().allow(null),
    difficultyLevel: Joi.string().valid('easy', 'medium', 'hard'),
    prerequisites: Joi.array().items(Joi.alternatives().try(uuidSchema, Joi.string().trim())),
  }).min(1),

  upsertLessonPlan: Joi.object({
    learningOutcomes: arrayOfStrings,
    teachingMethod: Joi.string().valid('lecture', 'activity', 'discussion', 'project'),
    instructionalSteps: arrayOfStrings,
    teachingAids: arrayOfStrings,
    requiredMaterials: arrayOfStrings,

    actualContent: Joi.string().allow('', null),
    text: Joi.string().allow('', null),
    images: arrayOfStrings,
    audio: arrayOfStrings,
    videos: arrayOfStrings,
    studentActivities: arrayOfStrings,
    integration: Joi.string().allow('', null),
    otherSubjects: arrayOfStrings,
    libraryReferences: arrayOfStrings,
    lifeLessons: Joi.string().allow('', null),

    assessmentMethod: Joi.string().allow('', null),
    rubric: Joi.string().allow('', null),
    homeworkAssigned: Joi.string().allow('', null),
    assessmentRemarks: Joi.string().allow('', null),
    progressStatus: Joi.string().valid('notStarted', 'ongoing', 'completed'),

    teacherReflection: Joi.string().allow('', null),
    improvementsForNextTime: Joi.string().allow('', null),
  }).min(1),
};

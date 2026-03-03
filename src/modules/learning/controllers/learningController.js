import { getPool } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';

const isAdmin = (user) => user?.role === 'admin';
const isTeacher = (user) => user?.role === 'teacher';

const getCurrentAcademicYearId = async () => {
  const result = await getPool().query(
    `SELECT id FROM academic_years WHERE is_current = true LIMIT 1`
  );
  return result.rows[0]?.id || null;
};

const ensureTeacherAssignedToSubject = async (teacherId, subjectId) => {
  const result = await getPool().query(
    `SELECT 1
     FROM teacher_subjects
     WHERE teacher_id = $1 AND subject_id = $2
     LIMIT 1`,
    [teacherId, subjectId]
  );

  return result.rows.length > 0;
};

const getSubjectIdForChapter = async (chapterId) => {
  const result = await getPool().query(
    'SELECT subject_id FROM learning_chapters WHERE id = $1',
    [chapterId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Chapter not found', 404);
  }

  return result.rows[0].subject_id;
};

const getSubjectIdForKeyConcept = async (keyConceptId) => {
  const result = await getPool().query(
    `SELECT ch.subject_id
     FROM learning_key_concepts kc
     JOIN learning_chapters ch ON ch.id = kc.chapter_id
     WHERE kc.id = $1`,
    [keyConceptId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Key concept not found', 404);
  }

  return result.rows[0].subject_id;
};

export const learningController = {
  async getAssignmentOptions(req, res, next) {
    try {
      const [teachers, classes, classSubjects, sections, academicYears] = await Promise.all([
        getPool().query(
          `SELECT id, first_name, last_name, email
           FROM users
           WHERE role = 'teacher' AND is_active = true
           ORDER BY first_name, last_name`
        ),
        getPool().query(
          `SELECT id, name, display_name, sequence_order
           FROM classes
           ORDER BY sequence_order, name`
        ),
        getPool().query(
          `SELECT cs.class_id, s.id AS subject_id, s.name AS subject_name, s.code AS subject_code
           FROM class_subjects cs
           JOIN subjects s ON s.id = cs.subject_id
           ORDER BY s.name`
        ),
        getPool().query(
          `SELECT id, class_id, name
           FROM sections
           ORDER BY name`
        ),
        getPool().query(
          `SELECT id, name, is_current
           FROM academic_years
           WHERE status = 'active'
           ORDER BY is_current DESC, start_date DESC`
        ),
      ]);

      res.json({
        success: true,
        data: {
          teachers: teachers.rows,
          classes: classes.rows,
          classSubjects: classSubjects.rows,
          sections: sections.rows,
          academicYears: academicYears.rows,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getTeacherAssignments(req, res, next) {
    try {
      const { teacher_id } = req.query;
      const params = [];
      let whereClause = '';

      if (teacher_id) {
        params.push(teacher_id);
        whereClause = 'WHERE ts.teacher_id = $1';
      }

      const result = await getPool().query(
        `SELECT
           ts.id,
           ts.teacher_id,
           ts.class_id,
           ts.subject_id,
           ts.section_id,
           ts.academic_year_id,
           ts.created_at,
           u.first_name || ' ' || u.last_name AS teacher_name,
           u.email AS teacher_email,
           c.display_name AS class_display_name,
           c.name AS class_name,
           s.name AS subject_name,
           s.code AS subject_code,
           sec.name AS section_name,
           ay.name AS academic_year_name
         FROM teacher_subjects ts
         JOIN users u ON u.id = ts.teacher_id
         JOIN classes c ON c.id = ts.class_id
         JOIN subjects s ON s.id = ts.subject_id
         LEFT JOIN sections sec ON sec.id = ts.section_id
         LEFT JOIN academic_years ay ON ay.id = ts.academic_year_id
         ${whereClause}
         ORDER BY c.sequence_order, s.name, teacher_name`,
        params
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async createTeacherAssignment(req, res, next) {
    try {
      const { teacher_id, class_id, subject_id, section_id, academic_year_id } = req.body;
      let academicYearId = academic_year_id || null;

      const teacherCheck = await getPool().query(
        `SELECT id FROM users WHERE id = $1 AND role = 'teacher' AND is_active = true`,
        [teacher_id]
      );

      if (teacherCheck.rows.length === 0) {
        throw new AppError('Valid teacher not found', 404);
      }

      const classSubjectCheck = await getPool().query(
        `SELECT 1 FROM class_subjects WHERE class_id = $1 AND subject_id = $2 LIMIT 1`,
        [class_id, subject_id]
      );

      if (classSubjectCheck.rows.length === 0) {
        throw new AppError('Selected subject is not mapped to the selected class', 400);
      }

      if (!academicYearId) {
        academicYearId = await getCurrentAcademicYearId();
      }

      const existingAssignment = await getPool().query(
        `SELECT id
         FROM teacher_subjects
         WHERE teacher_id = $1
           AND class_id = $2
           AND subject_id = $3
           AND section_id IS NOT DISTINCT FROM $4
           AND academic_year_id IS NOT DISTINCT FROM $5
         LIMIT 1`,
        [teacher_id, class_id, subject_id, section_id || null, academicYearId]
      );

      if (existingAssignment.rows.length > 0) {
        throw new AppError('Assignment already exists', 409);
      }

      const result = await getPool().query(
        `INSERT INTO teacher_subjects (
           teacher_id, class_id, subject_id, section_id, academic_year_id, created_by
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [teacher_id, class_id, subject_id, section_id || null, academicYearId, req.user.id]
      );

      res.status(201).json({
        success: true,
        message: 'Teacher assigned successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTeacherAssignment(req, res, next) {
    try {
      const { id } = req.params;
      const result = await getPool().query(
        `DELETE FROM teacher_subjects WHERE id = $1 RETURNING id`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Assignment not found', 404);
      }

      res.json({ success: true, message: 'Assignment removed successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getClassesWithSubjects(req, res, next) {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      if (isTeacher(req.user)) {
        const result = await getPool().query(
          `SELECT DISTINCT c.id, c.name, c.display_name, c.sequence_order,
                  s.id AS subject_id, s.name AS subject_name, s.code AS subject_code
           FROM teacher_subjects ts
           JOIN classes c ON c.id = ts.class_id
           JOIN subjects s ON s.id = ts.subject_id
           WHERE ts.teacher_id = $1
           ORDER BY c.sequence_order, s.name`,
          [userId]
        );

        return res.json({ success: true, data: result.rows });
      }

      if (isAdmin(req.user) || role === 'user') {
        const result = await getPool().query(
          `SELECT DISTINCT c.id, c.name, c.display_name, c.sequence_order,
                  s.id AS subject_id, s.name AS subject_name, s.code AS subject_code
           FROM classes c
           JOIN class_subjects cs ON cs.class_id = c.id
           JOIN subjects s ON s.id = cs.subject_id
           ORDER BY c.sequence_order, s.name`
        );

        return res.json({ success: true, data: result.rows });
      }

      throw new AppError('Access denied', 403);
    } catch (error) {
      next(error);
    }
  },

  async createChapter(req, res, next) {
    try {
      const { class_id, subject_id, chapterNo, title, description, pdf_url } = req.body;

      const result = await getPool().query(
        `INSERT INTO learning_chapters (class_id, subject_id, chapter_no, title, description, pdf_url, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
         RETURNING *`,
        [class_id, subject_id, chapterNo, title, description || null, pdf_url || null, req.user.id]
      );

      res.status(201).json({ success: true, message: 'Chapter created successfully', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getChapters(req, res, next) {
    try {
      const { class_id, subject_id } = req.query;
      const params = [];
      const conditions = [];

      if (class_id) {
        params.push(class_id);
        conditions.push(`ch.class_id = $${params.length}`);
      }

      if (subject_id) {
        params.push(subject_id);
        conditions.push(`ch.subject_id = $${params.length}`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const query = `
        SELECT ch.*, c.name AS class_name, c.display_name, s.name AS subject_name, s.code AS subject_code
        FROM learning_chapters ch
        JOIN classes c ON c.id = ch.class_id
        JOIN subjects s ON s.id = ch.subject_id
        ${whereClause}
        ORDER BY c.sequence_order, s.name, ch.chapter_no, ch.title
      `;

      const result = await getPool().query(query, params);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async updateChapter(req, res, next) {
    try {
      const { id } = req.params;
      const { chapterNo, title, description, pdf_url } = req.body;

      const result = await getPool().query(
        `UPDATE learning_chapters
         SET chapter_no = COALESCE($1, chapter_no),
             title = COALESCE($2, title),
             description = COALESCE($3, description),
             pdf_url = COALESCE($4, pdf_url),
             updated_by = $5,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [chapterNo, title, description, pdf_url, req.user.id, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Chapter not found', 404);
      }

      res.json({ success: true, message: 'Chapter updated successfully', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async deleteChapter(req, res, next) {
    try {
      const { id } = req.params;
      const result = await getPool().query('DELETE FROM learning_chapters WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        throw new AppError('Chapter not found', 404);
      }

      res.json({ success: true, message: 'Chapter deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async createKeyConcept(req, res, next) {
    try {
      const {
        title,
        description,
        chapter_id,
        totalSessionsRequired,
        sessionDurationMinutes,
        difficultyLevel,
        prerequisites,
      } = req.body;

      if (isTeacher(req.user)) {
        const subjectId = await getSubjectIdForChapter(chapter_id);
        const isAssigned = await ensureTeacherAssignedToSubject(req.user.id, subjectId);
        if (!isAssigned) {
          throw new AppError('You are not assigned to this subject', 403);
        }
      }

      const result = await getPool().query(
        `INSERT INTO learning_key_concepts (
            title, description, chapter_id, total_sessions_required, session_duration_minutes,
            difficulty_level, prerequisites, created_by, updated_by
         ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $8)
         RETURNING *`,
        [
          title,
          description || null,
          chapter_id,
          totalSessionsRequired,
          sessionDurationMinutes || null,
          difficultyLevel || 'medium',
          JSON.stringify(prerequisites || []),
          req.user.id,
        ]
      );

      res.status(201).json({ success: true, message: 'Key concept created successfully', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getKeyConcepts(req, res, next) {
    try {
      const { chapter_id } = req.query;
      const params = [];
      let condition = '';

      if (chapter_id) {
        params.push(chapter_id);
        condition = 'WHERE kc.chapter_id = $1';
      }

      const query = `
        SELECT kc.*, ch.title AS chapter_title, ch.subject_id,
               lp.id AS lesson_plan_id, lp.progress_status
        FROM learning_key_concepts kc
        JOIN learning_chapters ch ON ch.id = kc.chapter_id
        LEFT JOIN learning_lesson_plans lp ON lp.key_concept_id = kc.id
        ${condition}
        ORDER BY kc.title
      `;

      const result = await getPool().query(query, params);
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async updateKeyConcept(req, res, next) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        totalSessionsRequired,
        sessionDurationMinutes,
        difficultyLevel,
        prerequisites,
      } = req.body;

      if (isTeacher(req.user)) {
        const subjectId = await getSubjectIdForKeyConcept(id);
        const isAssigned = await ensureTeacherAssignedToSubject(req.user.id, subjectId);
        if (!isAssigned) {
          throw new AppError('You are not assigned to this subject', 403);
        }
      }

      const result = await getPool().query(
        `UPDATE learning_key_concepts
         SET title = COALESCE($1, title),
             description = COALESCE($2, description),
             total_sessions_required = COALESCE($3, total_sessions_required),
             session_duration_minutes = COALESCE($4, session_duration_minutes),
             difficulty_level = COALESCE($5, difficulty_level),
             prerequisites = COALESCE($6::jsonb, prerequisites),
             updated_by = $7,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $8
         RETURNING *`,
        [
          title,
          description,
          totalSessionsRequired,
          sessionDurationMinutes,
          difficultyLevel,
          prerequisites ? JSON.stringify(prerequisites) : null,
          req.user.id,
          id,
        ]
      );

      if (result.rows.length === 0) {
        throw new AppError('Key concept not found', 404);
      }

      res.json({ success: true, message: 'Key concept updated successfully', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async deleteKeyConcept(req, res, next) {
    try {
      const { id } = req.params;
      const result = await getPool().query('DELETE FROM learning_key_concepts WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        throw new AppError('Key concept not found', 404);
      }

      res.json({ success: true, message: 'Key concept deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async upsertLessonPlanForConcept(req, res, next) {
    try {
      const { keyConceptId } = req.params;

      const subjectId = await getSubjectIdForKeyConcept(keyConceptId);
      if (isTeacher(req.user)) {
        const isAssigned = await ensureTeacherAssignedToSubject(req.user.id, subjectId);
        if (!isAssigned) {
          throw new AppError('You are not assigned to this subject', 403);
        }
      }

      const existing = await getPool().query(
        `SELECT id, created_by FROM learning_lesson_plans WHERE key_concept_id = $1`,
        [keyConceptId]
      );

      const {
        learningOutcomes,
        teachingMethod,
        instructionalSteps,
        teachingAids,
        requiredMaterials,
        actualContent,
        text,
        images,
        audio,
        videos,
        studentActivities,
        integration,
        otherSubjects,
        libraryReferences,
        lifeLessons,
        assessmentMethod,
        rubric,
        homeworkAssigned,
        assessmentRemarks,
        progressStatus,
        teacherReflection,
        improvementsForNextTime,
      } = req.body;

      if (existing.rows.length > 0) {
        const currentPlan = existing.rows[0];

        if (isTeacher(req.user) && currentPlan.created_by !== req.user.id) {
          throw new AppError('You can edit only your own lesson plans', 403);
        }

        const result = await getPool().query(
          `UPDATE learning_lesson_plans
           SET learning_outcomes = COALESCE($1::jsonb, learning_outcomes),
               teaching_method = COALESCE($2, teaching_method),
               instructional_steps = COALESCE($3::jsonb, instructional_steps),
               teaching_aids = COALESCE($4::jsonb, teaching_aids),
               required_materials = COALESCE($5::jsonb, required_materials),
               actual_content = COALESCE($6, actual_content),
               content_text = COALESCE($7, content_text),
               content_images = COALESCE($8::jsonb, content_images),
               content_audio = COALESCE($9::jsonb, content_audio),
               content_videos = COALESCE($10::jsonb, content_videos),
               student_activities = COALESCE($11::jsonb, student_activities),
               integration = COALESCE($12, integration),
               other_subjects = COALESCE($13::jsonb, other_subjects),
               library_references = COALESCE($14::jsonb, library_references),
               life_lessons = COALESCE($15, life_lessons),
               assessment_method = COALESCE($16, assessment_method),
               rubric = COALESCE($17, rubric),
               homework_assigned = COALESCE($18, homework_assigned),
               assessment_remarks = COALESCE($19, assessment_remarks),
               progress_status = COALESCE($20, progress_status),
               teacher_reflection = COALESCE($21, teacher_reflection),
               improvements_for_next_time = COALESCE($22, improvements_for_next_time),
               updated_by = $23,
               updated_at = CURRENT_TIMESTAMP
           WHERE key_concept_id = $24
           RETURNING *`,
          [
            learningOutcomes ? JSON.stringify(learningOutcomes) : null,
            teachingMethod,
            instructionalSteps ? JSON.stringify(instructionalSteps) : null,
            teachingAids ? JSON.stringify(teachingAids) : null,
            requiredMaterials ? JSON.stringify(requiredMaterials) : null,
            actualContent,
            text,
            images ? JSON.stringify(images) : null,
            audio ? JSON.stringify(audio) : null,
            videos ? JSON.stringify(videos) : null,
            studentActivities ? JSON.stringify(studentActivities) : null,
            integration,
            otherSubjects ? JSON.stringify(otherSubjects) : null,
            libraryReferences ? JSON.stringify(libraryReferences) : null,
            lifeLessons,
            assessmentMethod,
            rubric,
            homeworkAssigned,
            assessmentRemarks,
            progressStatus,
            teacherReflection,
            improvementsForNextTime,
            req.user.id,
            keyConceptId,
          ]
        );

        return res.json({ success: true, message: 'Lesson plan updated successfully', data: result.rows[0] });
      }

      const result = await getPool().query(
        `INSERT INTO learning_lesson_plans (
          key_concept_id,
          learning_outcomes,
          teaching_method,
          instructional_steps,
          teaching_aids,
          required_materials,
          actual_content,
          content_text,
          content_images,
          content_audio,
          content_videos,
          student_activities,
          integration,
          other_subjects,
          library_references,
          life_lessons,
          assessment_method,
          rubric,
          homework_assigned,
          assessment_remarks,
          progress_status,
          teacher_reflection,
          improvements_for_next_time,
          created_by,
          updated_by
        ) VALUES (
          $1,
          $2::jsonb,
          $3,
          $4::jsonb,
          $5::jsonb,
          $6::jsonb,
          $7,
          $8,
          $9::jsonb,
          $10::jsonb,
          $11::jsonb,
          $12::jsonb,
          $13,
          $14::jsonb,
          $15::jsonb,
          $16,
          $17,
          $18,
          $19,
          $20,
          $21,
          $22,
          $23,
          $24,
          $24
        ) RETURNING *`,
        [
          keyConceptId,
          JSON.stringify(learningOutcomes || []),
          teachingMethod || 'lecture',
          JSON.stringify(instructionalSteps || []),
          JSON.stringify(teachingAids || []),
          JSON.stringify(requiredMaterials || []),
          actualContent || null,
          text || null,
          JSON.stringify(images || []),
          JSON.stringify(audio || []),
          JSON.stringify(videos || []),
          JSON.stringify(studentActivities || []),
          integration || null,
          JSON.stringify(otherSubjects || []),
          JSON.stringify(libraryReferences || []),
          lifeLessons || null,
          assessmentMethod || null,
          rubric || null,
          homeworkAssigned || null,
          assessmentRemarks || null,
          progressStatus || 'notStarted',
          teacherReflection || null,
          improvementsForNextTime || null,
          req.user.id,
        ]
      );

      res.status(201).json({ success: true, message: 'Lesson plan created successfully', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getLessonPlanByConcept(req, res, next) {
    try {
      const { keyConceptId } = req.params;

      const result = await getPool().query(
        `SELECT lp.*, kc.title AS key_concept_title, ch.title AS chapter_title, ch.subject_id
         FROM learning_lesson_plans lp
         JOIN learning_key_concepts kc ON kc.id = lp.key_concept_id
         JOIN learning_chapters ch ON ch.id = kc.chapter_id
         WHERE lp.key_concept_id = $1`,
        [keyConceptId]
      );

      if (result.rows.length === 0) {
        throw new AppError('Lesson plan not found for this key concept', 404);
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  async getMyLessonPlans(req, res, next) {
    try {
      const conditions = [];
      const params = [];

      if (isTeacher(req.user)) {
        params.push(req.user.id);
        conditions.push(`lp.created_by = $${params.length}`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await getPool().query(
        `SELECT
           lp.id,
           lp.key_concept_id,
           lp.progress_status,
           lp.teaching_method,
           lp.learning_outcomes,
           lp.actual_content,
           lp.content_text,
           lp.instructional_steps,
           lp.teaching_aids,
           lp.required_materials,
           lp.content_images,
           lp.content_audio,
           lp.content_videos,
           lp.student_activities,
           lp.integration,
           lp.other_subjects,
           lp.library_references,
           lp.life_lessons,
           lp.assessment_method,
           lp.rubric,
           lp.homework_assigned,
           lp.assessment_remarks,
           lp.teacher_reflection,
           lp.improvements_for_next_time,
           lp.created_at,
           lp.updated_at,
           kc.title  AS key_concept_title,
           kc.total_sessions_required,
           kc.difficulty_level,
           ch.id     AS chapter_id,
           ch.title  AS chapter_title,
           ch.chapter_no,
           ch.class_id,
           ch.subject_id,
           c.name    AS class_name,
           c.display_name AS class_display_name,
           s.name    AS subject_name
         FROM learning_lesson_plans lp
         JOIN learning_key_concepts kc ON kc.id = lp.key_concept_id
         JOIN learning_chapters    ch ON ch.id = kc.chapter_id
         JOIN classes              c  ON c.id  = ch.class_id
         JOIN subjects             s  ON s.id  = ch.subject_id
         ${whereClause}
         ORDER BY c.sequence_order, s.name, ch.chapter_no, ch.title, kc.title`,
        params
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  async deleteLessonPlan(req, res, next) {
    try {
      const { id } = req.params;

      // Fetch the plan to check ownership
      const existing = await getPool().query(
        `SELECT id, created_by FROM learning_lesson_plans WHERE id = $1`,
        [id]
      );

      if (existing.rows.length === 0) {
        throw new AppError('Lesson plan not found', 404);
      }

      // Teachers may only delete their own plans; admins can delete any
      if (isTeacher(req.user) && existing.rows[0].created_by !== req.user.id) {
        throw new AppError('You are not authorised to delete this lesson plan', 403);
      }

      await getPool().query(`DELETE FROM learning_lesson_plans WHERE id = $1`, [id]);

      res.json({ success: true, message: 'Lesson plan deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async getHierarchy(req, res, next) {
    try {
      const { class_id, subject_id } = req.query;
      const params = [];
      const conditions = [];

      if (class_id) {
        params.push(class_id);
        conditions.push(`ch.class_id = $${params.length}`);
      }

      if (subject_id) {
        params.push(subject_id);
        conditions.push(`ch.subject_id = $${params.length}`);
      }

      if (isTeacher(req.user)) {
        params.push(req.user.id);
        conditions.push(`EXISTS (
          SELECT 1 FROM teacher_subjects ts
          WHERE ts.teacher_id = $${params.length}
            AND ts.subject_id = ch.subject_id
            AND ts.class_id = ch.class_id
        )`);
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await getPool().query(
        `SELECT
           ch.id AS chapter_id,
           ch.chapter_no,
           ch.title AS chapter_title,
           ch.description AS chapter_description,
           ch.class_id,
           c.name AS class_name,
           c.display_name AS class_display_name,
           ch.subject_id,
           s.name AS subject_name,
           s.code AS subject_code,
           kc.id AS key_concept_id,
           kc.title AS key_concept_title,
           kc.description AS key_concept_description,
           kc.total_sessions_required,
           kc.session_duration_minutes,
           kc.difficulty_level,
           kc.prerequisites,
           lp.id AS lesson_plan_id,
           lp.progress_status,
           lp.created_by
         FROM learning_chapters ch
         JOIN classes c ON c.id = ch.class_id
         JOIN subjects s ON s.id = ch.subject_id
         LEFT JOIN learning_key_concepts kc ON kc.chapter_id = ch.id
         LEFT JOIN learning_lesson_plans lp ON lp.key_concept_id = kc.id
         ${whereClause}
         ORDER BY c.sequence_order, s.name, ch.chapter_no, ch.title, kc.title`,
        params
      );

      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },
};

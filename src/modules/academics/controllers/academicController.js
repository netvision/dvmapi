import { getPool } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';

export const academicController = {
  // Get all academic years
  async getAllAcademicYears(req, res, next) {
    try {
      const result = await getPool().query(
        `SELECT * FROM academic_years ORDER BY start_date DESC`
      );
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Get current academic year
  async getCurrentAcademicYear(req, res, next) {
    try {
      const result = await getPool().query(
        `SELECT * FROM academic_years WHERE is_current = true LIMIT 1`
      );
      if (result.rows.length === 0) {
        throw new AppError('No current academic year set', 404);
      }
      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Get all classes with sections and subjects
  async getAllClasses(req, res, next) {
    try {
      const { academic_year_id, level } = req.query;
      
      let query = `
        SELECT c.*, 
               ay.name as academic_year_name,
               u.first_name || ' ' || u.last_name as class_teacher_name,
               COUNT(DISTINCT s.id) as section_count,
               COUNT(DISTINCT cs.subject_id) as subject_count
        FROM classes c
        LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
        LEFT JOIN users u ON c.class_teacher_id = u.id
        LEFT JOIN sections s ON s.class_id = c.id
        LEFT JOIN class_subjects cs ON cs.class_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      if (academic_year_id) {
        params.push(academic_year_id);
        query += ` AND c.academic_year_id = $${params.length}`;
      }
      if (level) {
        params.push(level);
        query += ` AND c.level = $${params.length}`;
      }
      
      query += ` GROUP BY c.id, ay.name, u.first_name, u.last_name ORDER BY c.sequence_order`;
      
      const result = await getPool().query(query, params);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Get class details with sections and subjects
  async getClassDetails(req, res, next) {
    try {
      const { id } = req.params;
      
      const classResult = await getPool().query(
        `SELECT c.*, ay.name as academic_year_name
         FROM classes c
         LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
         WHERE c.id = $1`,
        [id]
      );
      
      if (classResult.rows.length === 0) {
        throw new AppError('Class not found', 404);
      }
      
      const sections = await getPool().query(
        `SELECT s.*, 
                u.first_name || ' ' || u.last_name as class_teacher_name,
                COUNT(st.id) as student_count
         FROM sections s
         LEFT JOIN users u ON s.class_teacher_id = u.id
         LEFT JOIN students st ON st.class = $2 AND st.section = s.name AND st.status = 'active'
         WHERE s.class_id = $1
         GROUP BY s.id, u.first_name, u.last_name
         ORDER BY s.name`,
        [id, classResult.rows[0].name]
      );
      
      const subjects = await getPool().query(
        `SELECT s.*, cs.is_mandatory, cs.theory_marks, cs.practical_marks, cs.internal_marks
         FROM subjects s
         JOIN class_subjects cs ON s.id = cs.subject_id
         WHERE cs.class_id = $1
         ORDER BY s.subject_type, s.name`,
        [id]
      );
      
      res.json({
        ...classResult.rows[0],
        sections: sections.rows,
        subjects: subjects.rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all subjects
  async getAllSubjects(req, res, next) {
    try {
      const { type, practical } = req.query;
      
      let query = 'SELECT * FROM subjects WHERE 1=1';
      const params = [];
      
      if (type) {
        params.push(type);
        query += ` AND subject_type = $${params.length}`;
      }
      if (practical !== undefined) {
        params.push(practical === 'true');
        query += ` AND is_practical = $${params.length}`;
      }
      
      query += ' ORDER BY subject_type, name';
      
      const result = await getPool().query(query, params);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Get subjects for a specific class
  async getClassSubjects(req, res, next) {
    try {
      const { classId } = req.params;
      
      const result = await getPool().query(
        `SELECT s.*, cs.is_mandatory, cs.theory_marks, cs.practical_marks, cs.internal_marks
         FROM subjects s
         JOIN class_subjects cs ON s.id = cs.subject_id
         WHERE cs.class_id = $1
         ORDER BY 
           CASE s.subject_type
             WHEN 'core' THEN 1
             WHEN 'language' THEN 2
             WHEN 'elective' THEN 3
             WHEN 'vocational' THEN 4
             WHEN 'co-curricular' THEN 5
           END,
           s.name`,
        [classId]
      );
      
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Get sections for a class
  async getClassSections(req, res, next) {
    try {
      const { classId } = req.params;
      
      const result = await getPool().query(
        `SELECT s.*,
                u.first_name || ' ' || u.last_name as class_teacher_name,
                COUNT(st.id) as student_count
         FROM sections s
         LEFT JOIN users u ON s.class_teacher_id = u.id
         LEFT JOIN students st ON st.section = s.name AND st.status = 'active'
         WHERE s.class_id = $1
         GROUP BY s.id, u.first_name, u.last_name
         ORDER BY s.name`,
        [classId]
      );
      
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Get academic structure statistics
  async getStatistics(req, res, next) {
    try {
      const stats = await getPool().query(`
        SELECT 
          (SELECT COUNT(*) FROM academic_years WHERE status = 'active') as total_academic_years,
          (SELECT COUNT(*) FROM classes) as total_classes,
          (SELECT COUNT(*) FROM sections) as total_sections,
          (SELECT COUNT(*) FROM subjects) as total_subjects,
          (SELECT COUNT(*) FROM class_subjects) as total_class_subject_mappings,
          (SELECT COUNT(*) FROM teacher_subjects) as total_teacher_assignments,
          (SELECT COUNT(DISTINCT level) FROM classes) as total_levels
      `);
      
      res.json(stats.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Create a new class
  async createClass(req, res, next) {
    try {
      const { name, display_name, level, sequence_order, wing, capacity, description, class_abbreviation } = req.body;
      const userId = req.user.id;

      const result = await getPool().query(
        `INSERT INTO classes (name, display_name, level, sequence_order, wing, capacity, description, class_abbreviation, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [name, display_name, level, sequence_order, wing || null, capacity || null, description || null, class_abbreviation || name, userId, userId]
      );

      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a class
  async updateClass(req, res, next) {
    try {
      const { id } = req.params;
      const { name, display_name, level, sequence_order, wing, capacity, description, class_teacher_id, class_abbreviation, is_active } = req.body;
      const userId = req.user.id;

      const result = await getPool().query(
        `UPDATE classes 
         SET name = COALESCE($1, name),
             display_name = COALESCE($2, display_name),
             level = COALESCE($3, level),
             sequence_order = COALESCE($4, sequence_order),
             wing = COALESCE($5, wing),
             capacity = COALESCE($6, capacity),
             description = COALESCE($7, description),
             class_teacher_id = COALESCE($8, class_teacher_id),
             class_abbreviation = COALESCE($9, class_abbreviation),
             is_active = COALESCE($10, is_active),
             updated_by = $11,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [name, display_name, level, sequence_order, wing, capacity, description, class_teacher_id, class_abbreviation, is_active, userId, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Class not found', 404);
      }

      res.json({
        success: true,
        message: 'Class updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a class
  async deleteClass(req, res, next) {
    try {
      const { id } = req.params;

      // Check if class has sections
      const sectionsCheck = await getPool().query(
        'SELECT COUNT(*) FROM sections WHERE class_id = $1',
        [id]
      );

      if (parseInt(sectionsCheck.rows[0].count) > 0) {
        throw new AppError('Cannot delete class with existing sections. Please delete sections first.', 400);
      }

      const result = await getPool().query(
        'DELETE FROM classes WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Class not found', 404);
      }

      res.json({
        success: true,
        message: 'Class deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Create a new section
  async createSection(req, res, next) {
    try {
      const { class_id, name, capacity, room_number, class_teacher_id, floor_number, building_name, section_abbreviation, wing } = req.body;
      const userId = req.user.id;

      const result = await getPool().query(
        `INSERT INTO sections (class_id, name, capacity, room_number, class_teacher_id, floor_number, building_name, section_abbreviation, wing, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [class_id, name, capacity || null, room_number || null, class_teacher_id || null, floor_number || null, building_name || null, section_abbreviation || name, wing || null, userId, userId]
      );

      res.status(201).json({
        success: true,
        message: 'Section created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Update a section
  async updateSection(req, res, next) {
    try {
      const { id } = req.params;
      const { name, capacity, room_number, class_teacher_id, floor_number, building_name, section_abbreviation, wing, is_active } = req.body;
      const userId = req.user.id;

      const result = await getPool().query(
        `UPDATE sections 
         SET name = COALESCE($1, name),
             capacity = COALESCE($2, capacity),
             room_number = COALESCE($3, room_number),
             class_teacher_id = COALESCE($4, class_teacher_id),
             floor_number = COALESCE($5, floor_number),
             building_name = COALESCE($6, building_name),
             section_abbreviation = COALESCE($7, section_abbreviation),
             wing = COALESCE($8, wing),
             is_active = COALESCE($9, is_active),
             updated_by = $10,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $11
         RETURNING *`,
        [name, capacity, room_number, class_teacher_id, floor_number, building_name, section_abbreviation, wing, is_active, userId, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Section not found', 404);
      }

      res.json({
        success: true,
        message: 'Section updated successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete a section
  async deleteSection(req, res, next) {
    try {
      const { id } = req.params;

      // Check if section has students
      const studentsCheck = await getPool().query(
        `SELECT COUNT(*) FROM students st
         JOIN sections s ON st.section = s.name
         WHERE s.id = $1 AND st.status = 'active'`,
        [id]
      );

      if (parseInt(studentsCheck.rows[0].count) > 0) {
        throw new AppError('Cannot delete section with active students. Please transfer students first.', 400);
      }

      const result = await getPool().query(
        'DELETE FROM sections WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Section not found', 404);
      }

      res.json({
        success: true,
        message: 'Section deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};

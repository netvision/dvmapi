import { getPool } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

export const studentController = {
  // Create a new student
  async create(req, res, next) {
    try {
      const pool = getPool();
      const {
        admission_number, roll_number, first_name, middle_name, last_name,
        date_of_birth, gender, blood_group, nationality, religion, category, aadhar_number,
        email, phone, address, city, state, pincode,
        class: studentClass, section, academic_year, admission_date, status,
        parent1_name, parent1_relation, parent1_phone, parent1_email, parent1_occupation, parent1_annual_income,
        parent2_name, parent2_relation, parent2_phone, parent2_email, parent2_occupation, parent2_annual_income,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
        photo_url, medical_conditions, allergies, previous_school, transfer_certificate_number, notes
      } = req.body;

      const created_by = req.user.id;

      const result = await pool.query(
        `INSERT INTO students (
          admission_number, roll_number, first_name, middle_name, last_name,
          date_of_birth, gender, blood_group, nationality, religion, category, aadhar_number,
          email, phone, address, city, state, pincode,
          class, section, academic_year, admission_date, status,
          parent1_name, parent1_relation, parent1_phone, parent1_email, parent1_occupation, parent1_annual_income,
          parent2_name, parent2_relation, parent2_phone, parent2_email, parent2_occupation, parent2_annual_income,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          photo_url, medical_conditions, allergies, previous_school, transfer_certificate_number, notes,
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
          $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45
        ) RETURNING *`,
        [
          admission_number, roll_number, first_name, middle_name, last_name,
          date_of_birth, gender, blood_group, nationality, religion, category, aadhar_number,
          email, phone, address, city, state, pincode,
          studentClass, section, academic_year, admission_date, status || 'active',
          parent1_name, parent1_relation, parent1_phone, parent1_email, parent1_occupation, parent1_annual_income,
          parent2_name, parent2_relation, parent2_phone, parent2_email, parent2_occupation, parent2_annual_income,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          photo_url, medical_conditions, allergies, previous_school, transfer_certificate_number, notes,
          created_by, created_by
        ]
      );

      logger.info('Student created', { studentId: result.rows[0].id, createdBy: created_by });

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: { student: result.rows[0] }
      });
    } catch (error) {
      if (error.code === '23505') { // Unique constraint violation
        return next(new AppError('Admission number already exists', 409));
      }
      next(error);
    }
  },

  // Get all students with filtering and pagination
  async getAll(req, res, next) {
    try {
      const pool = getPool();
      const {
        page = 1,
        limit = 50,
        class: studentClass,
        section,
        status = 'active',
        academic_year,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM students WHERE 1=1';
      const params = [];
      let paramCount = 1;

      // Apply filters
      if (studentClass) {
        query += ` AND class = $${paramCount++}`;
        params.push(studentClass);
      }

      if (section) {
        query += ` AND section = $${paramCount++}`;
        params.push(section);
      }

      if (status) {
        query += ` AND status = $${paramCount++}`;
        params.push(status);
      }

      if (academic_year) {
        query += ` AND academic_year = $${paramCount++}`;
        params.push(academic_year);
      }

      // Search by name or admission number
      if (search) {
        query += ` AND (
          LOWER(first_name) LIKE LOWER($${paramCount}) OR 
          LOWER(last_name) LIKE LOWER($${paramCount}) OR 
          LOWER(admission_number) LIKE LOWER($${paramCount})
        )`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Get total count
      const countResult = await pool.query(
        query.replace('SELECT *', 'SELECT COUNT(*)'),
        params
      );
      const totalStudents = parseInt(countResult.rows[0].count);

      // Add sorting and pagination
      query += ` ORDER BY first_name, last_name LIMIT $${paramCount++} OFFSET $${paramCount}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: {
          students: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalStudents / limit),
            totalStudents,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get student by ID
  async getById(req, res, next) {
    try {
      const pool = getPool();
      const { id } = req.params;

      const result = await pool.query(
        'SELECT * FROM students WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Student not found', 404);
      }

      res.json({
        success: true,
        data: { student: result.rows[0] }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get student by admission number
  async getByAdmissionNumber(req, res, next) {
    try {
      const pool = getPool();
      const { admission_number } = req.params;

      const result = await pool.query(
        'SELECT * FROM students WHERE admission_number = $1',
        [admission_number]
      );

      if (result.rows.length === 0) {
        throw new AppError('Student not found', 404);
      }

      res.json({
        success: true,
        data: { student: result.rows[0] }
      });
    } catch (error) {
      next(error);
    }
  },

  // Update student
  async update(req, res, next) {
    try {
      const pool = getPool();
      const { id } = req.params;
      const updated_by = req.user.id;
      const updateData = { ...req.body, updated_by };

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;
      delete updateData.created_by;

      // Build dynamic update query
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);
      
      if (fields.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const result = await pool.query(
        `UPDATE students SET ${setClause} WHERE id = $1 RETURNING *`,
        [id, ...values]
      );

      if (result.rows.length === 0) {
        throw new AppError('Student not found', 404);
      }

      logger.info('Student updated', { studentId: id, updatedBy: updated_by });

      res.json({
        success: true,
        message: 'Student updated successfully',
        data: { student: result.rows[0] }
      });
    } catch (error) {
      if (error.code === '23505') {
        return next(new AppError('Admission number already exists', 409));
      }
      next(error);
    }
  },

  // Delete student (soft delete by changing status)
  async delete(req, res, next) {
    try {
      const pool = getPool();
      const { id } = req.params;
      const updated_by = req.user.id;

      const result = await pool.query(
        `UPDATE students SET status = 'inactive', updated_by = $2 WHERE id = $1 RETURNING *`,
        [id, updated_by]
      );

      if (result.rows.length === 0) {
        throw new AppError('Student not found', 404);
      }

      logger.info('Student deactivated', { studentId: id, deactivatedBy: updated_by });

      res.json({
        success: true,
        message: 'Student deactivated successfully',
        data: { student: result.rows[0] }
      });
    } catch (error) {
      next(error);
    }
  },

  // Permanently delete student (admin only)
  async permanentDelete(req, res, next) {
    try {
      const pool = getPool();
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM students WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Student not found', 404);
      }

      logger.warn('Student permanently deleted', { studentId: id, deletedBy: req.user.id });

      res.json({
        success: true,
        message: 'Student permanently deleted'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get statistics
  async getStatistics(req, res, next) {
    try {
      const pool = getPool();
      const { academic_year } = req.query;

      let yearFilter = '';
      const params = [];

      if (academic_year) {
        yearFilter = 'AND academic_year = $1';
        params.push(academic_year);
      }

      const stats = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'active') as active_students,
          COUNT(*) FILTER (WHERE status = 'inactive') as inactive_students,
          COUNT(*) FILTER (WHERE gender = 'male') as male_students,
          COUNT(*) FILTER (WHERE gender = 'female') as female_students,
          COUNT(DISTINCT class) as total_classes,
          COUNT(DISTINCT academic_year) as academic_years
        FROM students
        WHERE 1=1 ${yearFilter}
      `, params);

      const classSummary = await pool.query(`
        SELECT 
          class, 
          section,
          COUNT(*) as student_count,
          COUNT(*) FILTER (WHERE gender = 'male') as male_count,
          COUNT(*) FILTER (WHERE gender = 'female') as female_count
        FROM students
        WHERE status = 'active' ${yearFilter}
        GROUP BY class, section
        ORDER BY class, section
      `, params);

      res.json({
        success: true,
        data: {
          overview: stats.rows[0],
          classSummary: classSummary.rows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create login credentials for a student (admin only)
  async createCredentials(req, res, next) {
    try {
      const pool = getPool();
      const { id } = req.params;

      const studentResult = await pool.query(
        `SELECT id, admission_number, first_name, last_name, email, user_id, status
         FROM students
         WHERE id = $1`,
        [id]
      );

      if (studentResult.rows.length === 0) {
        throw new AppError('Student not found', 404);
      }

      const student = studentResult.rows[0];

      if (student.status === 'inactive' || student.status === 'transferred') {
        throw new AppError('Cannot create credentials for inactive/transferred student', 400);
      }

      if (student.user_id) {
        const existingLinkedUser = await pool.query(
          'SELECT id FROM users WHERE CAST(id AS TEXT) = CAST($1 AS TEXT)',
          [student.user_id]
        );

        if (existingLinkedUser.rows.length > 0) {
          throw new AppError('Student already has login credentials', 409);
        }
      }

      let loginEmail = student.email?.trim();
      if (!loginEmail) {
        loginEmail = `student.${String(student.admission_number).toLowerCase()}@institute.local`;
      }

      const emailExists = await pool.query('SELECT id FROM users WHERE email = $1', [loginEmail]);
      if (emailExists.rows.length > 0) {
        throw new AppError(`Email ${loginEmail} is already used by another user`, 409);
      }

      const temporaryPassword = `Stu@${randomBytes(4).toString('hex')}`;
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      const userResult = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, email, first_name, last_name, role, is_active, created_at`,
        [loginEmail, hashedPassword, student.first_name, student.last_name, 'student']
      );

      const user = userResult.rows[0];

      await pool.query(
        `UPDATE students
         SET user_id = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id, user.id, req.user.id]
      );

      logger.info('Student credentials created', {
        studentId: id,
        userId: user.id,
        createdBy: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Student login credentials created successfully',
        data: {
          user,
          temporaryPassword
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get dashboard data for currently logged-in student
  async getMyDashboard(req, res, next) {
    try {
      const pool = getPool();

      const studentResult = await pool.query(
        `SELECT id, admission_number, first_name, last_name, class, section, academic_year, status
         FROM students
         WHERE CAST(user_id AS TEXT) = $1
         LIMIT 1`,
        [String(req.user.id)]
      );

      if (studentResult.rows.length === 0) {
        throw new AppError('No student profile is linked with this login', 404);
      }

      const student = studentResult.rows[0];

      const attendanceTable = await pool.query(
        `SELECT to_regclass('public.student_attendance') IS NOT NULL AS exists`
      );

      const resultsTable = await pool.query(
        `SELECT to_regclass('public.student_exam_results') IS NOT NULL AS exists`
      );

      let attendanceSummary = {
        present_days: 0,
        absent_days: 0,
        late_days: 0,
        total_marked_days: 0
      };

      if (attendanceTable.rows[0].exists) {
        const attendanceResult = await pool.query(
          `SELECT
             COUNT(*) FILTER (WHERE status = 'present') AS present_days,
             COUNT(*) FILTER (WHERE status = 'absent') AS absent_days,
             COUNT(*) FILTER (WHERE status = 'late') AS late_days,
             COUNT(*) AS total_marked_days
           FROM student_attendance
           WHERE student_id = $1`,
          [student.id]
        );
        attendanceSummary = attendanceResult.rows[0];
      }

      let resultsSummary = {
        exams_attempted: 0,
        average_percentage: 0
      };

      if (resultsTable.rows[0].exists) {
        const resultsResult = await pool.query(
          `SELECT
             COUNT(DISTINCT examination_id) AS exams_attempted,
             COALESCE(ROUND(AVG((marks_obtained / NULLIF(total_marks, 0)) * 100), 2), 0) AS average_percentage
           FROM student_exam_results
           WHERE student_id = $1`,
          [student.id]
        );
        resultsSummary = resultsResult.rows[0];
      }

      res.json({
        success: true,
        data: {
          profile: student,
          attendance: attendanceSummary,
          results: resultsSummary
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Mark or update attendance for a class/date in bulk
  async markAttendance(req, res, next) {
    try {
      const pool = getPool();
      const { attendance_date, class: studentClass, section, records } = req.body;

      const updatedRows = [];
      for (const record of records) {
        const studentCheck = await pool.query(
          `SELECT id FROM students
           WHERE id = $1 AND class = $2
           AND ($3::text IS NULL OR $3 = '' OR section = $3)
           LIMIT 1`,
          [record.student_id, studentClass, section || null]
        );

        if (studentCheck.rows.length === 0) {
          continue;
        }

        const result = await pool.query(
          `INSERT INTO student_attendance (student_id, attendance_date, status, remarks, marked_by)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (student_id, attendance_date)
           DO UPDATE SET
             status = EXCLUDED.status,
             remarks = EXCLUDED.remarks,
             marked_by = EXCLUDED.marked_by,
             updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [record.student_id, attendance_date, record.status, record.remarks || null, req.user.id]
        );

        updatedRows.push(result.rows[0]);
      }

      res.json({
        success: true,
        message: 'Attendance saved successfully',
        data: {
          attendance_date,
          class: studentClass,
          section: section || null,
          totalMarked: updatedRows.length,
          records: updatedRows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get attendance for class/date (with full student list)
  async getAttendanceByClassDate(req, res, next) {
    try {
      const pool = getPool();
      const { attendance_date, class: studentClass, section } = req.query;

      const result = await pool.query(
        `SELECT
           s.id,
           s.admission_number,
           s.roll_number,
           s.first_name,
           s.last_name,
           s.class,
           s.section,
           sa.status,
           sa.remarks,
           sa.attendance_date
         FROM students s
         LEFT JOIN student_attendance sa
           ON sa.student_id = s.id AND sa.attendance_date = $1
         WHERE s.class = $2
           AND ($3::text IS NULL OR $3 = '' OR s.section = $3)
           AND s.status = 'active'
         ORDER BY s.first_name, s.last_name`,
        [attendance_date, studentClass, section || null]
      );

      res.json({
        success: true,
        data: {
          attendance_date,
          class: studentClass,
          section: section || null,
          students: result.rows
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get attendance history for a student
  async getStudentAttendance(req, res, next) {
    try {
      const pool = getPool();
      const { studentId } = req.params;

      if (req.user.role === 'student') {
        const ownership = await pool.query(
          `SELECT id FROM students WHERE id = $1 AND CAST(user_id AS TEXT) = $2 LIMIT 1`,
          [studentId, String(req.user.id)]
        );

        if (ownership.rows.length === 0) {
          throw new AppError('Access denied', 403);
        }
      }

      const result = await pool.query(
        `SELECT id, student_id, attendance_date, status, remarks, marked_by, created_at, updated_at
         FROM student_attendance
         WHERE student_id = $1
         ORDER BY attendance_date DESC`,
        [studentId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  },

  // Insert or update an exam result row
  async upsertExamResult(req, res, next) {
    try {
      const pool = getPool();
      const {
        student_id,
        examination_id,
        examination_name,
        subject,
        marks_obtained,
        total_marks,
        grade,
        remarks,
        exam_date
      } = req.body;

      const result = await pool.query(
        `INSERT INTO student_exam_results (
           student_id, examination_id, examination_name, subject,
           marks_obtained, total_marks, grade, remarks, exam_date, entered_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (student_id, examination_id, subject)
         DO UPDATE SET
           examination_name = EXCLUDED.examination_name,
           marks_obtained = EXCLUDED.marks_obtained,
           total_marks = EXCLUDED.total_marks,
           grade = EXCLUDED.grade,
           remarks = EXCLUDED.remarks,
           exam_date = EXCLUDED.exam_date,
           entered_by = EXCLUDED.entered_by,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          student_id,
          examination_id,
          examination_name,
          subject,
          marks_obtained,
          total_marks,
          grade || null,
          remarks || null,
          exam_date || null,
          req.user.id
        ]
      );

      res.json({
        success: true,
        message: 'Exam result saved successfully',
        data: result.rows[0]
      });
    } catch (error) {
      next(error);
    }
  },

  // Get exam results with filters
  async getExamResults(req, res, next) {
    try {
      const pool = getPool();
      const {
        student_id,
        examination_id,
        class: studentClass,
        section,
        academic_year,
        limit = 100
      } = req.query;

      let effectiveStudentId = student_id;
      if (req.user.role === 'student') {
        const me = await pool.query(
          `SELECT id FROM students WHERE CAST(user_id AS TEXT) = $1 LIMIT 1`,
          [String(req.user.id)]
        );

        if (me.rows.length === 0) {
          throw new AppError('No student profile is linked with this login', 404);
        }

        effectiveStudentId = me.rows[0].id;
      }

      let query = `
        SELECT
          ser.*,
          s.admission_number,
          s.first_name,
          s.last_name,
          s.class,
          s.section,
          s.academic_year
        FROM student_exam_results ser
        JOIN students s ON s.id = ser.student_id
        WHERE 1=1
      `;
      const params = [];
      let index = 1;

      if (effectiveStudentId) {
        query += ` AND ser.student_id = $${index++}`;
        params.push(effectiveStudentId);
      }
      if (examination_id) {
        query += ` AND ser.examination_id = $${index++}`;
        params.push(examination_id);
      }
      if (studentClass) {
        query += ` AND s.class = $${index++}`;
        params.push(studentClass);
      }
      if (section) {
        query += ` AND s.section = $${index++}`;
        params.push(section);
      }
      if (academic_year) {
        query += ` AND s.academic_year = $${index++}`;
        params.push(academic_year);
      }

      query += ` ORDER BY ser.exam_date DESC NULLS LAST, s.first_name, ser.subject LIMIT $${index}`;
      params.push(limit);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      next(error);
    }
  }
};

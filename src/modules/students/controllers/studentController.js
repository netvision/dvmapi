import { getPool } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';

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
  }
};

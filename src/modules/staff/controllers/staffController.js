import { getPool } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';

export const staffController = {
  // Get all staff with pagination and filters
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 50,
        search,
        staff_type,
        department,
        designation,
        status = 'active',
        employment_type
      } = req.query;

      const offset = (page - 1) * limit;
      let query = `
        SELECT s.*, 
               u.email as user_email,
               COUNT(*) OVER() as total_count
        FROM staff s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (search) {
        params.push(`%${search}%`);
        query += ` AND (s.first_name ILIKE $${params.length} OR s.last_name ILIKE $${params.length} OR s.employee_id ILIKE $${params.length} OR s.email ILIKE $${params.length})`;
      }

      if (staff_type) {
        params.push(staff_type);
        query += ` AND s.staff_type = $${params.length}`;
      }

      if (department) {
        params.push(department);
        query += ` AND s.department = $${params.length}`;
      }

      if (designation) {
        params.push(designation);
        query += ` AND s.designation = $${params.length}`;
      }

      if (status) {
        params.push(status);
        query += ` AND s.status = $${params.length}`;
      }

      if (employment_type) {
        params.push(employment_type);
        query += ` AND s.employment_type = $${params.length}`;
      }

      query += ` ORDER BY s.first_name, s.last_name`;
      params.push(limit, offset);
      query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

      const result = await getPool().query(query, params);

      const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
      const totalPages = Math.ceil(totalCount / limit);

      res.json({
        data: result.rows.map(row => {
          const { total_count, ...staff } = row;
          return staff;
        }),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get staff by ID
  async getById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await getPool().query(
        `SELECT s.*, u.email as user_email, u.role as user_role
         FROM staff s
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Staff member not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Get staff by employee ID
  async getByEmployeeId(req, res, next) {
    try {
      const { employee_id } = req.params;

      const result = await getPool().query(
        'SELECT * FROM staff WHERE employee_id = $1',
        [employee_id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Staff member not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Create new staff member
  async create(req, res, next) {
    try {
      const staffData = req.body;
      const createdBy = req.user.id;

      const result = await getPool().query(
        `INSERT INTO staff (
          employee_id, first_name, middle_name, last_name, date_of_birth, gender,
          blood_group, nationality, religion, category, marital_status,
          email, phone, alternate_phone, aadhar_number, pan_number,
          address, city, state, pincode,
          staff_type, designation, department, date_of_joining, employment_type, status,
          highest_qualification, qualifications, specialization, experience_years, previous_experience,
          basic_salary, gross_salary, bank_name, bank_account_number, bank_ifsc,
          pf_number, esi_number, photo_url, resume_url, documents,
          emergency_contact_name, emergency_contact_phone, emergency_contact_relation,
          medical_conditions, allergies, subjects_can_teach, notes, created_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
          $45, $46, $47, $48, $49
        ) RETURNING *`,
        [
          staffData.employee_id, staffData.first_name, staffData.middle_name, staffData.last_name,
          staffData.date_of_birth, staffData.gender, staffData.blood_group, staffData.nationality,
          staffData.religion, staffData.category, staffData.marital_status,
          staffData.email, staffData.phone, staffData.alternate_phone, staffData.aadhar_number,
          staffData.pan_number, staffData.address, staffData.city, staffData.state, staffData.pincode,
          staffData.staff_type, staffData.designation, staffData.department, staffData.date_of_joining,
          staffData.employment_type, staffData.status || 'active',
          staffData.highest_qualification, JSON.stringify(staffData.qualifications || []),
          staffData.specialization, staffData.experience_years, staffData.previous_experience,
          staffData.basic_salary, staffData.gross_salary, staffData.bank_name,
          staffData.bank_account_number, staffData.bank_ifsc, staffData.pf_number, staffData.esi_number,
          staffData.photo_url, staffData.resume_url, JSON.stringify(staffData.documents || []),
          staffData.emergency_contact_name, staffData.emergency_contact_phone,
          staffData.emergency_contact_relation, staffData.medical_conditions, staffData.allergies,
          JSON.stringify(staffData.subjects_can_teach || []), staffData.notes, createdBy
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Update staff member
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedBy = req.user.id;

      const fields = [];
      const values = [];
      let paramCount = 1;

      Object.keys(updates).forEach(key => {
        if (key !== 'id' && key !== 'created_at' && key !== 'created_by') {
          if (['qualifications', 'documents', 'subjects_can_teach'].includes(key)) {
            values.push(JSON.stringify(updates[key]));
          } else {
            values.push(updates[key]);
          }
          fields.push(`${key} = $${paramCount}`);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      values.push(updatedBy, id);
      fields.push(`updated_by = $${paramCount}`);
      paramCount++;

      const query = `
        UPDATE staff 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;

      const result = await getPool().query(query, values);

      if (result.rows.length === 0) {
        throw new AppError('Staff member not found', 404);
      }

      res.json(result.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Delete (soft delete) staff member
  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const updatedBy = req.user.id;

      const result = await getPool().query(
        `UPDATE staff SET status = 'resigned', updated_by = $1 WHERE id = $2 RETURNING *`,
        [updatedBy, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Staff member not found', 404);
      }

      res.json({ message: 'Staff member marked as resigned', data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // Get staff statistics
  async getStatistics(req, res, next) {
    try {
      const stats = await getPool().query(`
        SELECT 
          COUNT(*) as total_staff,
          COUNT(*) FILTER (WHERE staff_type = 'teaching') as total_teaching,
          COUNT(*) FILTER (WHERE staff_type = 'non-teaching') as total_non_teaching,
          COUNT(*) FILTER (WHERE staff_type = 'administrative') as total_administrative,
          COUNT(*) FILTER (WHERE staff_type = 'support') as total_support,
          COUNT(*) FILTER (WHERE status = 'active') as total_active,
          COUNT(*) FILTER (WHERE status = 'on-leave') as total_on_leave,
          COUNT(*) FILTER (WHERE employment_type = 'permanent') as total_permanent,
          COUNT(*) FILTER (WHERE employment_type = 'contract') as total_contract
        FROM staff
      `);

      res.json(stats.rows[0]);
    } catch (error) {
      next(error);
    }
  },

  // Get staff leave balance
  async getLeaveBalance(req, res, next) {
    try {
      const { id } = req.params;
      const { academic_year_id } = req.query;

      let query = 'SELECT * FROM staff_leave_balance WHERE staff_id = $1';
      const params = [id];

      if (academic_year_id) {
        params.push(academic_year_id);
        query += ` AND academic_year_id = $${params.length}`;
      }

      query += ' ORDER BY leave_type';

      const result = await getPool().query(query, params);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  },

  // Get staff leaves
  async getLeaves(req, res, next) {
    try {
      const { id } = req.params;
      const { status, year } = req.query;

      let query = `
        SELECT sl.*, 
               s.first_name || ' ' || s.last_name as staff_name,
               s.employee_id,
               u.first_name || ' ' || u.last_name as approved_by_name
        FROM staff_leaves sl
        JOIN staff s ON sl.staff_id = s.id
        LEFT JOIN users u ON sl.approved_by = u.id
        WHERE sl.staff_id = $1
      `;
      const params = [id];

      if (status) {
        params.push(status);
        query += ` AND sl.status = $${params.length}`;
      }

      if (year) {
        params.push(`${year}-%`);
        query += ` AND TO_CHAR(sl.start_date, 'YYYY-MM-DD') LIKE $${params.length}`;
      }

      query += ' ORDER BY sl.created_at DESC';

      const result = await getPool().query(query, params);
      res.json(result.rows);
    } catch (error) {
      next(error);
    }
  }
};

import { query } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';

export const userController = {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (page - 1) * limit;

      let queryText = `
        SELECT id, email, first_name, last_name, role, is_active, created_at, last_login
        FROM users
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        queryText += ` AND role = $${paramCount}`;
        params.push(role);
      }

      if (search) {
        paramCount++;
        queryText += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM users WHERE 1=1';
      const countParams = [];
      let countParamCount = 0;

      if (role) {
        countParamCount++;
        countQuery += ` AND role = $${countParamCount}`;
        countParams.push(role);
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (first_name ILIKE $${countParamCount} OR last_name ILIKE $${countParamCount} OR email ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT id, email, first_name, last_name, role, is_active, created_at, last_login
         FROM users WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user (admin only)
   */
  async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { first_name, last_name, role, is_active } = req.body;

      const result = await query(
        `UPDATE users
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             role = COALESCE($3, role),
             is_active = COALESCE($4, is_active),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, email, first_name, last_name, role, is_active, updated_at`,
        [first_name, last_name, role, is_active, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      logger.info('User updated', { adminId: req.user.id, userId: id });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      // Prevent self-deletion
      if (id === req.user.id) {
        throw new AppError('Cannot delete your own account', 400);
      }

      const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      logger.info('User deleted', { adminId: req.user.id, userId: id });

      res.json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

import { query } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';
import bcrypt from 'bcrypt';

export const userController = {
  /**
   * Get all users (admin only)
   */
  async getAllUsers(req, res, next) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (page - 1) * limit;

      const filterParams = [];
      const conditions = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        conditions.push(`EXISTS (SELECT 1 FROM user_roles ur2 WHERE ur2.user_id = u.id AND ur2.role_name = $${paramCount})`);
        filterParams.push(role);
      }

      if (search) {
        paramCount++;
        conditions.push(`(u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
        filterParams.push(`%${search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countResult = await query(
        `SELECT COUNT(*) FROM users u ${whereClause}`,
        filterParams
      );
      const total = parseInt(countResult.rows[0].count);

      const result = await query(`
        SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at, u.last_login,
               COALESCE(
                 (SELECT array_agg(role_name ORDER BY role_name) FROM user_roles WHERE user_id = u.id),
                 ARRAY[u.role]
               ) as roles
        FROM users u
        ${whereClause}
        ORDER BY u.created_at DESC
        LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
      `, [...filterParams, limit, offset]);

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
        `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at, u.last_login,
                COALESCE(
                  (SELECT array_agg(role_name ORDER BY role_name) FROM user_roles WHERE user_id = u.id),
                  ARRAY[u.role]
                ) as roles
         FROM users u WHERE u.id = $1`,
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
      const { first_name, last_name, roles, is_active } = req.body;
      const primaryRole = roles && roles.length > 0 ? roles[0] : undefined;

      const result = await query(
        `UPDATE users
         SET first_name = COALESCE($1, first_name),
             last_name = COALESCE($2, last_name),
             role = COALESCE($3, role),
             is_active = COALESCE($4, is_active),
             updated_at = NOW()
         WHERE id = $5
         RETURNING id, email, first_name, last_name, role, is_active, updated_at`,
        [first_name, last_name, primaryRole, is_active, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      const user = result.rows[0];

      if (roles && roles.length > 0) {
        await query('DELETE FROM user_roles WHERE user_id = $1', [id]);
        for (const roleName of roles) {
          await query(
            'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [id, roleName]
          );
        }
        user.roles = roles;
      } else {
        const rolesResult = await query(
          'SELECT role_name FROM user_roles WHERE user_id = $1 ORDER BY role_name',
          [id]
        );
        user.roles = rolesResult.rows.map(r => r.role_name);
      }

      logger.info('User updated', { adminId: req.user.id, userId: id });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create user (admin only)
   */
  async createUser(req, res, next) {
    try {
      const { email, password, first_name, last_name, roles = ['user'] } = req.body;
      const primaryRole = roles[0];

      const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existing.rows.length > 0) {
        throw new AppError('Email already registered', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         RETURNING id, email, first_name, last_name, role, is_active, created_at`,
        [email, hashedPassword, first_name || null, last_name || null, primaryRole]
      );

      const user = result.rows[0];

      for (const roleName of roles) {
        await query(
          'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user.id, roleName]
        );
      }
      user.roles = roles;

      logger.info('User created by admin', { adminId: req.user.id, userId: user.id });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user,
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

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters long', 400);
      }

      // Check if user exists
      const userCheck = await query('SELECT id, email FROM users WHERE id = $1', [id]);
      if (userCheck.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, id]
      );

      logger.info('Password reset by admin', { 
        adminId: req.user.id, 
        userId: id, 
        targetEmail: userCheck.rows[0].email 
      });

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle user active status (admin only)
   */
  async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;

      // Prevent self-suspension
      if (id === req.user.id) {
        throw new AppError('Cannot change your own status', 400);
      }

      const result = await query(
        `UPDATE users
         SET is_active = NOT is_active,
             updated_at = NOW()
         WHERE id = $1
         RETURNING id, email, first_name, last_name, is_active`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      logger.info('User status toggled', { 
        adminId: req.user.id, 
        userId: id, 
        newStatus: result.rows[0].is_active 
      });

      res.json({
        success: true,
        message: `User ${result.rows[0].is_active ? 'activated' : 'suspended'} successfully`,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },
};

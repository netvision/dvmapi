import { query } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';

export const rolesController = {
  /**
   * Get all roles (admin + superadmin)
   */
  async getAllRoles(req, res, next) {
    try {
      const result = await query(
        'SELECT id, name, display_name, description, is_system, created_at FROM roles ORDER BY is_system DESC, display_name ASC'
      );
      res.json({ success: true, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new role (superadmin only)
   */
  async createRole(req, res, next) {
    try {
      const { name, display_name, description } = req.body;

      const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      if (!normalizedName) {
        throw new AppError('Invalid role name', 400);
      }

      const result = await query(
        `INSERT INTO roles (name, display_name, description, is_system)
         VALUES ($1, $2, $3, false)
         RETURNING id, name, display_name, description, is_system, created_at`,
        [normalizedName, display_name.trim(), description?.trim() || null]
      );

      logger.info('Role created', { name: normalizedName, createdBy: req.user.id });

      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (error) {
      if (error.code === '23505') {
        return next(new AppError(`Role '${req.body.name}' already exists`, 409));
      }
      next(error);
    }
  },

  /**
   * Update a role's display name / description (superadmin only)
   */
  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const { display_name, description } = req.body;

      const existing = await query('SELECT id, is_system FROM roles WHERE id = $1', [id]);
      if (existing.rows.length === 0) throw new AppError('Role not found', 404);

      const result = await query(
        `UPDATE roles
         SET display_name = $1, description = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, name, display_name, description, is_system`,
        [display_name.trim(), description?.trim() || null, id]
      );

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a role (superadmin only; system roles and roles in use are protected)
   */
  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;

      const existing = await query('SELECT id, name, is_system FROM roles WHERE id = $1', [id]);
      if (existing.rows.length === 0) throw new AppError('Role not found', 404);

      const role = existing.rows[0];
      if (role.is_system) throw new AppError('System roles cannot be deleted', 400);

      const usersWithRole = await query('SELECT COUNT(*) FROM users WHERE role = $1', [role.name]);
      const count = parseInt(usersWithRole.rows[0].count);
      if (count > 0) {
        throw new AppError(`Cannot delete: ${count} user(s) currently assigned to this role`, 409);
      }

      await query('DELETE FROM roles WHERE id = $1', [id]);

      logger.info('Role deleted', { name: role.name, deletedBy: req.user.id });

      res.json({ success: true, message: 'Role deleted successfully' });
    } catch (error) {
      next(error);
    }
  },
};

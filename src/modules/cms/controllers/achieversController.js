import { query } from '../../../database/connection.js';
import logger from '../../../shared/utils/logger.js';

export const achieversController = {
  // Get all achievers
  async getAchievers(req, res) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category, 
        year,
        is_active = true,
        sort_by = 'display_order',
        sort_order = 'ASC'
      } = req.query;

      const offset = (page - 1) * limit;
      const conditions = [];
      const values = [];
      let paramCount = 1;

      if (category) {
        conditions.push(`category = $${paramCount}`);
        values.push(category);
        paramCount++;
      }

      if (year) {
        conditions.push(`year = $${paramCount}`);
        values.push(year);
        paramCount++;
      }

      if (is_active !== undefined && is_active !== 'all') {
        conditions.push(`is_active = $${paramCount}`);
        values.push(is_active === 'true' || is_active === true);
        paramCount++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      
      // Validate sort fields
      const validSortFields = ['display_order', 'year', 'name', 'created_at'];
      const validSortOrders = ['ASC', 'DESC'];
      const orderBy = validSortFields.includes(sort_by) ? sort_by : 'display_order';
      const order = validSortOrders.includes(sort_order.toUpperCase()) ? sort_order.toUpperCase() : 'ASC';

      const achieversQuery = `
        SELECT id, name, photo_url, achievement, category, year, display_order, is_active, created_at, updated_at
        FROM achievers
        ${whereClause}
        ORDER BY ${orderBy} ${order}
        LIMIT $${paramCount} OFFSET $${paramCount + 1}
      `;
      
      values.push(limit, offset);

      const countQuery = `
        SELECT COUNT(*) 
        FROM achievers 
        ${whereClause}
      `;

      const [achieversResult, countResult] = await Promise.all([
        query(achieversQuery, values),
        query(countQuery, values.slice(0, -2))
      ]);

      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: achieversResult.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get achievers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch achievers',
        error: error.message
      });
    }
  },

  // Get single achiever
  async getAchiever(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        `SELECT id, name, photo_url, achievement, category, year, display_order, is_active, created_at, updated_at
         FROM achievers
         WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Achiever not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      logger.error('Get achiever error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch achiever',
        error: error.message
      });
    }
  },

  // Create achiever
  async createAchiever(req, res) {
    try {
      const { name, photo_url, achievement, category, year, display_order = 0, is_active = true } = req.body;

      const result = await query(
        `INSERT INTO achievers (name, photo_url, achievement, category, year, display_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, photo_url, achievement, category, year, display_order, is_active, created_at`,
        [name, photo_url || null, achievement, category, year, display_order, is_active]
      );

      logger.info(`Achiever created: ${name} by user ${req.user.id}`);

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Achiever created successfully'
      });
    } catch (error) {
      logger.error('Create achiever error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create achiever',
        error: error.message
      });
    }
  },

  // Update achiever
  async updateAchiever(req, res) {
    try {
      const { id } = req.params;
      const { name, photo_url, achievement, category, year, display_order, is_active } = req.body;

      // Check if achiever exists
      const checkResult = await query('SELECT id FROM achievers WHERE id = $1', [id]);
      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Achiever not found'
        });
      }

      // Build dynamic update query
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (name !== undefined) {
        updates.push(`name = $${paramCount}`);
        values.push(name);
        paramCount++;
      }

      if (photo_url !== undefined) {
        updates.push(`photo_url = $${paramCount}`);
        values.push(photo_url || null);
        paramCount++;
      }

      if (achievement !== undefined) {
        updates.push(`achievement = $${paramCount}`);
        values.push(achievement);
        paramCount++;
      }

      if (category !== undefined) {
        updates.push(`category = $${paramCount}`);
        values.push(category);
        paramCount++;
      }

      if (year !== undefined) {
        updates.push(`year = $${paramCount}`);
        values.push(year);
        paramCount++;
      }

      if (display_order !== undefined) {
        updates.push(`display_order = $${paramCount}`);
        values.push(display_order);
        paramCount++;
      }

      if (is_active !== undefined) {
        updates.push(`is_active = $${paramCount}`);
        values.push(is_active);
        paramCount++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE achievers 
         SET ${updates.join(', ')}
         WHERE id = $${paramCount}
         RETURNING id, name, photo_url, achievement, category, year, display_order, is_active, updated_at`,
        values
      );

      logger.info(`Achiever updated: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        data: result.rows[0],
        message: 'Achiever updated successfully'
      });
    } catch (error) {
      logger.error('Update achiever error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update achiever',
        error: error.message
      });
    }
  },

  // Delete achiever
  async deleteAchiever(req, res) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM achievers WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Achiever not found'
        });
      }

      logger.info(`Achiever deleted: ${id} by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Achiever deleted successfully'
      });
    } catch (error) {
      logger.error('Delete achiever error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete achiever',
        error: error.message
      });
    }
  }
};

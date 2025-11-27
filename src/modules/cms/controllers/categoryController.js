import { query } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';

export const categoryController = {
  /**
   * Get all news categories
   */
  async getAllCategories(req, res, next) {
    try {
      const result = await query(
        `SELECT id, name, slug, description, created_at
         FROM news_categories
         ORDER BY name ASC`
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create a new category
   */
  async createCategory(req, res, next) {
    try {
      const { name, slug, description } = req.body;

      const result = await query(
        `INSERT INTO news_categories (name, slug, description)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, slug || name.toLowerCase().replace(/\s+/g, '-'), description]
      );

      logger.info('Category created', { categoryId: result.rows[0].id });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },
};

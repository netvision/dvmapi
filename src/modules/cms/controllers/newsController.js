import { query } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const newsController = {
  /**
   * Get all news articles (public or filtered)
   */
  async getAllNews(req, res, next) {
    try {
      const { page = 1, limit = 10, status, search } = req.query;
      const offset = (page - 1) * limit;

      let queryText = `
        SELECT n.id, n.title, n.slug, n.excerpt, n.content, n.featured_image_url, n.category_id,
               n.status, n.published_at, n.views, n.created_at, n.updated_at,
               u.id as author_id, u.first_name as author_first_name, u.last_name as author_last_name,
               c.name as category_name
        FROM news n
        LEFT JOIN users u ON n.author_id = u.id
        LEFT JOIN news_categories c ON n.category_id = c.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      // Only show published news to non-authenticated users
      if (!req.user) {
        queryText += ` AND n.status = 'published'`;
      } else if (status) {
        paramCount++;
        queryText += ` AND n.status = $${paramCount}`;
        params.push(status);
      }

      if (search) {
        paramCount++;
        queryText += ` AND (n.title ILIKE $${paramCount} OR n.content ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      queryText += ` ORDER BY n.published_at DESC, n.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM news WHERE 1=1';
      const countParams = [];
      let countParamCount = 0;

      if (!req.user) {
        countQuery += ` AND status = 'published'`;
      } else if (status) {
        countParamCount++;
        countQuery += ` AND status = $${countParamCount}`;
        countParams.push(status);
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (title ILIKE $${countParamCount} OR content ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows.map(row => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          excerpt: row.excerpt,
          content: row.content,
          featured_image_url: row.featured_image_url,
          category_id: row.category_id,
          category_name: row.category_name,
          status: row.status,
          published_at: row.published_at,
          views: row.views,
          author: row.author_id ? {
            id: row.author_id,
            name: `${row.author_first_name} ${row.author_last_name}`
          } : null,
          created_at: row.created_at,
          updated_at: row.updated_at
        })),
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
   * Get single news article by slug or ID
   */
  async getNewsBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const result = await query(
        `SELECT n.id, n.title, n.slug, n.excerpt, n.content, n.featured_image_url,
                n.status, n.published_at, n.views, n.created_at, n.updated_at,
                u.id as author_id, u.first_name as author_first_name, u.last_name as author_last_name
         FROM news n
         LEFT JOIN users u ON n.author_id = u.id
         WHERE n.slug = $1`,
        [slug]
      );

      if (result.rows.length === 0) {
        throw new AppError('News article not found', 404);
      }

      const article = result.rows[0];

      // Only show published articles to non-authenticated users
      if (!req.user && article.status !== 'published') {
        throw new AppError('News article not found', 404);
      }

      // Increment view count
      await query('UPDATE news SET views = views + 1 WHERE id = $1', [article.id]);

      // Fetch gallery images
      const galleryResult = await query(
        `SELECT id, image_url, caption, display_order
         FROM news_gallery
         WHERE news_id = $1
         ORDER BY display_order ASC`,
        [article.id]
      );

      res.json({
        success: true,
        data: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt,
          content: article.content,
          featured_image_url: article.featured_image_url,
          status: article.status,
          published_at: article.published_at,
          views: article.views + 1,
          author: article.author_id ? {
            id: article.author_id,
            name: `${article.author_first_name} ${article.author_last_name}`
          } : null,
          gallery: galleryResult.rows,
          created_at: article.created_at,
          updated_at: article.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create news article (admin only)
   */
  async createNews(req, res, next) {
    try {
      const { title, excerpt, content, featured_image_url, category_id, status = 'draft', gallery = [] } = req.body;

      const slug = generateSlug(title);

      // Check if slug already exists
      const existing = await query('SELECT id FROM news WHERE slug = $1', [slug]);
      if (existing.rows.length > 0) {
        throw new AppError('A news article with similar title already exists', 409);
      }

      const published_at = status === 'published' ? new Date() : null;
      
      // Convert category_id to number if it's a string
      const categoryId = category_id ? parseInt(category_id, 10) : null;

      const result = await query(
        `INSERT INTO news (title, slug, excerpt, content, featured_image_url, category_id, author_id, status, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, title, slug, excerpt, content, featured_image_url, category_id, status, published_at, created_at`,
        [title, slug, excerpt, content, featured_image_url, categoryId, req.user.id, status, published_at]
      );

      const newsId = result.rows[0].id;

      // Insert gallery images if provided
      if (gallery && gallery.length > 0) {
        for (let i = 0; i < gallery.length; i++) {
          const { url, caption } = gallery[i];
          await query(
            `INSERT INTO news_gallery (news_id, image_url, caption, display_order)
             VALUES ($1, $2, $3, $4)`,
            [newsId, url, caption || null, i]
          );
        }
      }

      logger.info('News article created', { userId: req.user.id, newsId });

      res.status(201).json({
        success: true,
        message: 'News article created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update news article (admin only)
   */
  async updateNews(req, res, next) {
    try {
      const { id } = req.params;
      const { title, excerpt, content, featured_image_url, category_id, status, gallery } = req.body;

      // Get current article
      const current = await query('SELECT * FROM news WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        throw new AppError('News article not found', 404);
      }

      const updates = [];
      const values = [];
      let paramCount = 0;

      if (title) {
        paramCount++;
        updates.push(`title = $${paramCount}`);
        values.push(title);
        
        // Update slug if title changed
        const newSlug = generateSlug(title);
        if (newSlug !== current.rows[0].slug) {
          paramCount++;
          updates.push(`slug = $${paramCount}`);
          values.push(newSlug);
        }
      }

      if (excerpt !== undefined) {
        paramCount++;
        updates.push(`excerpt = $${paramCount}`);
        values.push(excerpt);
      }

      if (content !== undefined) {
        paramCount++;
        updates.push(`content = $${paramCount}`);
        values.push(content);
      }

      if (featured_image_url !== undefined) {
        paramCount++;
        updates.push(`featured_image_url = $${paramCount}`);
        values.push(featured_image_url);
      }

      if (category_id !== undefined) {
        paramCount++;
        updates.push(`category_id = $${paramCount}`);
        const categoryIdNum = category_id ? parseInt(category_id, 10) : null;
        values.push(categoryIdNum);
      }

      if (status !== undefined) {
        paramCount++;
        updates.push(`status = $${paramCount}`);
        values.push(status);

        // Set published_at if changing to published
        if (status === 'published' && current.rows[0].status !== 'published') {
          paramCount++;
          updates.push(`published_at = $${paramCount}`);
          values.push(new Date());
        }
      }

      if (updates.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      paramCount++;
      values.push(id);

      const result = await query(
        `UPDATE news SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${paramCount}
         RETURNING id, title, slug, excerpt, content, featured_image_url, status, published_at, updated_at`,
        values
      );

      // Update gallery if provided
      if (gallery !== undefined) {
        // Delete existing gallery images
        await query('DELETE FROM news_gallery WHERE news_id = $1', [id]);
        
        // Insert new gallery images
        if (gallery && gallery.length > 0) {
          for (let i = 0; i < gallery.length; i++) {
            const { url, caption } = gallery[i];
            await query(
              `INSERT INTO news_gallery (news_id, image_url, caption, display_order)
               VALUES ($1, $2, $3, $4)`,
              [id, url, caption || null, i]
            );
          }
        }
      }

      logger.info('News article updated', { userId: req.user.id, newsId: id });

      res.json({
        success: true,
        message: 'News article updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete news article (admin only)
   */
  async deleteNews(req, res, next) {
    try {
      const { id } = req.params;

      const result = await query('DELETE FROM news WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        throw new AppError('News article not found', 404);
      }

      logger.info('News article deleted', { userId: req.user.id, newsId: id });

      res.json({
        success: true,
        message: 'News article deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

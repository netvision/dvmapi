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

export const eventsController = {
  /**
   * Get all events
   */
  async getAllEvents(req, res, next) {
    try {
      const { page = 1, limit = 10, status, upcoming, search } = req.query;
      const offset = (page - 1) * limit;

      let queryText = `
        SELECT e.id, e.title, e.slug, e.description, e.location, e.start_date, e.end_date,
               e.featured_image_url, e.capacity, e.status, e.created_at, e.updated_at,
               u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name
        FROM events e
        LEFT JOIN users u ON e.organizer_id = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        queryText += ` AND e.status = $${paramCount}`;
        params.push(status);
      }

      // Filter upcoming events
      if (upcoming === 'true') {
        queryText += ` AND e.start_date >= NOW()`;
      }

      if (search) {
        paramCount++;
        queryText += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      queryText += ` ORDER BY e.start_date ASC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM events WHERE 1=1';
      const countParams = [];
      let countParamCount = 0;

      if (status) {
        countParamCount++;
        countQuery += ` AND status = $${countParamCount}`;
        countParams.push(status);
      }

      if (upcoming === 'true') {
        countQuery += ` AND start_date >= NOW()`;
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (title ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
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
          description: row.description,
          location: row.location,
          start_date: row.start_date,
          end_date: row.end_date,
          featured_image_url: row.featured_image_url,
          capacity: row.capacity,
          status: row.status,
          organizer: row.organizer_id ? {
            id: row.organizer_id,
            name: `${row.organizer_first_name} ${row.organizer_last_name}`
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
   * Get single event by slug
   */
  async getEventBySlug(req, res, next) {
    try {
      const { slug } = req.params;

      const result = await query(
        `SELECT e.id, e.title, e.slug, e.description, e.location, e.start_date, e.end_date,
                e.featured_image_url, e.capacity, e.status, e.created_at, e.updated_at,
                u.id as organizer_id, u.first_name as organizer_first_name, u.last_name as organizer_last_name
         FROM events e
         LEFT JOIN users u ON e.organizer_id = u.id
         WHERE e.slug = $1`,
        [slug]
      );

      if (result.rows.length === 0) {
        throw new AppError('Event not found', 404);
      }

      const event = result.rows[0];

      // Fetch gallery images
      const galleryResult = await query(
        `SELECT id, image_url, caption, display_order
         FROM events_gallery
         WHERE event_id = $1
         ORDER BY display_order ASC`,
        [event.id]
      );

      res.json({
        success: true,
        data: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          location: event.location,
          start_date: event.start_date,
          end_date: event.end_date,
          featured_image_url: event.featured_image_url,
          capacity: event.capacity,
          status: event.status,
          organizer: event.organizer_id ? {
            id: event.organizer_id,
            name: `${event.organizer_first_name} ${event.organizer_last_name}`
          } : null,
          gallery: galleryResult.rows,
          created_at: event.created_at,
          updated_at: event.updated_at
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create event (admin only)
   */
  async createEvent(req, res, next) {
    try {
      const { 
        title, 
        description, 
        location, 
        start_date, 
        end_date, 
        featured_image_url,
        capacity,
        status = 'upcoming',
        gallery = []
      } = req.body;

      const slug = generateSlug(title);

      // Check if slug already exists
      const existing = await query('SELECT id FROM events WHERE slug = $1', [slug]);
      if (existing.rows.length > 0) {
        throw new AppError('An event with similar title already exists', 409);
      }

      // Validate dates
      if (new Date(end_date) < new Date(start_date)) {
        throw new AppError('End date must be after start date', 400);
      }

      const result = await query(
        `INSERT INTO events (title, slug, description, location, start_date, end_date, 
                            featured_image_url, organizer_id, capacity, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, title, slug, description, location, start_date, end_date, 
                   featured_image_url, capacity, status, created_at`,
        [title, slug, description, location, start_date, end_date, featured_image_url, 
         req.user.id, capacity, status]
      );

      const eventId = result.rows[0].id;

      // Insert gallery images if provided
      if (gallery && gallery.length > 0) {
        for (let i = 0; i < gallery.length; i++) {
          const { url, caption } = gallery[i];
          await query(
            `INSERT INTO events_gallery (event_id, image_url, caption, display_order)
             VALUES ($1, $2, $3, $4)`,
            [eventId, url, caption || null, i]
          );
        }
      }

      logger.info('Event created', { userId: req.user.id, eventId });

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update event (admin only)
   */
  async updateEvent(req, res, next) {
    try {
      const { id } = req.params;
      const { 
        title, 
        description, 
        location, 
        start_date, 
        end_date, 
        featured_image_url,
        capacity,
        status,
        gallery
      } = req.body;

      // Get current event
      const current = await query('SELECT * FROM events WHERE id = $1', [id]);
      if (current.rows.length === 0) {
        throw new AppError('Event not found', 404);
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

      if (description !== undefined) {
        paramCount++;
        updates.push(`description = $${paramCount}`);
        values.push(description);
      }

      if (location !== undefined) {
        paramCount++;
        updates.push(`location = $${paramCount}`);
        values.push(location);
      }

      if (start_date) {
        paramCount++;
        updates.push(`start_date = $${paramCount}`);
        values.push(start_date);
      }

      if (end_date) {
        paramCount++;
        updates.push(`end_date = $${paramCount}`);
        values.push(end_date);
      }

      if (featured_image_url !== undefined) {
        paramCount++;
        updates.push(`featured_image_url = $${paramCount}`);
        values.push(featured_image_url);
      }

      if (capacity !== undefined) {
        paramCount++;
        updates.push(`capacity = $${paramCount}`);
        values.push(capacity);
      }

      if (status) {
        paramCount++;
        updates.push(`status = $${paramCount}`);
        values.push(status);
      }

      if (updates.length === 0) {
        throw new AppError('No fields to update', 400);
      }

      paramCount++;
      values.push(id);

      const result = await query(
        `UPDATE events SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${paramCount}
         RETURNING id, title, slug, description, location, start_date, end_date, 
                   featured_image_url, capacity, status, updated_at`,
        values
      );

      // Update gallery if provided
      if (gallery !== undefined) {
        // Delete existing gallery images
        await query('DELETE FROM events_gallery WHERE event_id = $1', [id]);
        
        // Insert new gallery images
        if (gallery && gallery.length > 0) {
          for (let i = 0; i < gallery.length; i++) {
            const { url, caption } = gallery[i];
            await query(
              `INSERT INTO events_gallery (event_id, image_url, caption, display_order)
               VALUES ($1, $2, $3, $4)`,
              [id, url, caption || null, i]
            );
          }
        }
      }

      logger.info('Event updated', { userId: req.user.id, eventId: id });

      res.json({
        success: true,
        message: 'Event updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete event (admin only)
   */
  async deleteEvent(req, res, next) {
    try {
      const { id } = req.params;

      const result = await query('DELETE FROM events WHERE id = $1 RETURNING id', [id]);

      if (result.rows.length === 0) {
        throw new AppError('Event not found', 404);
      }

      logger.info('Event deleted', { userId: req.user.id, eventId: id });

      res.json({
        success: true,
        message: 'Event deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

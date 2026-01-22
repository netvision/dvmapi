import Joi from 'joi';

export const newsSchemas = {
  createNews: Joi.object({
    title: Joi.string().min(5).max(500).required(),
    excerpt: Joi.string().max(1000).optional().allow(null, ''),
    content: Joi.string().min(10).required(),
    featured_image_url: Joi.string().uri().optional().allow(null, ''),
    category_id: Joi.number().integer().positive().optional().allow(null),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    gallery: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().max(500).optional().allow(null, '')
      })
    ).optional()
  }),

  updateNews: Joi.object({
    title: Joi.string().min(5).max(500).optional(),
    excerpt: Joi.string().max(1000).optional().allow(null, ''),
    content: Joi.string().min(10).optional(),
    featured_image_url: Joi.string().uri().optional().allow(null, ''),
    category_id: Joi.number().integer().positive().optional().allow(null),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
    gallery: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        caption: Joi.string().max(500).optional().allow(null, '')
      })
    ).optional()
  }),
};

export const eventsSchemas = {
  createEvent: Joi.object({
    title: Joi.string().min(5).max(500).required(),
    description: Joi.string().optional(),
    location: Joi.string().max(255).optional(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref('start_date')).required(),
    featured_image_url: Joi.string().uri().optional().allow(null, ''),
    capacity: Joi.number().integer().min(1).optional(),
    status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').optional(),
  }),

  updateEvent: Joi.object({
    title: Joi.string().min(5).max(500).optional(),
    description: Joi.string().optional().allow(null, ''),
    location: Joi.string().max(255).optional().allow(null, ''),
    start_date: Joi.date().iso().optional(),
    end_date: Joi.date().iso().optional(),
    featured_image_url: Joi.string().uri().optional().allow(null, ''),
    capacity: Joi.number().integer().min(1).optional().allow(null),
    status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').optional(),
  }),
};

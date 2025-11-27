import Joi from 'joi';

export const newsSchemas = {
  createNews: Joi.object({
    title: Joi.string().min(5).max(500).required(),
    excerpt: Joi.string().max(1000).optional(),
    content: Joi.string().min(10).required(),
    featured_image_url: Joi.string().uri().optional().allow(null, ''),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
  }),

  updateNews: Joi.object({
    title: Joi.string().min(5).max(500).optional(),
    excerpt: Joi.string().max(1000).optional(),
    content: Joi.string().min(10).optional(),
    featured_image_url: Joi.string().uri().optional().allow(null, ''),
    status: Joi.string().valid('draft', 'published', 'archived').optional(),
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

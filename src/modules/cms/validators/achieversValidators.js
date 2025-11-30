import Joi from 'joi';

export const achieversSchemas = {
  createAchiever: Joi.object({
    name: Joi.string().min(2).max(255).required(),
    photo_url: Joi.string().uri().optional().allow(null, ''),
    achievement: Joi.string().min(5).required(),
    category: Joi.string().max(100).required(),
    year: Joi.number().integer().min(2000).max(2100).required(),
    display_order: Joi.number().integer().optional(),
    is_active: Joi.boolean().optional(),
  }),

  updateAchiever: Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    photo_url: Joi.string().uri().optional().allow(null, ''),
    achievement: Joi.string().min(5).optional(),
    category: Joi.string().max(100).optional(),
    year: Joi.number().integer().min(2000).max(2100).optional(),
    display_order: Joi.number().integer().optional(),
    is_active: Joi.boolean().optional(),
  }),
};

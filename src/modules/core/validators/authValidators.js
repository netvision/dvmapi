import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    role: Joi.string().min(1).optional(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().min(2).optional(),
    last_name: Joi.string().min(2).optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

export const userSchemas = {
  updateUser: Joi.object({
    first_name: Joi.string().min(2).optional(),
    last_name: Joi.string().min(2).optional(),
    roles: Joi.array().items(Joi.string().min(1)).min(1).optional(),
    is_active: Joi.boolean().optional(),
  }),
  createUser: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().min(2).optional(),
    last_name: Joi.string().min(2).optional(),
    roles: Joi.array().items(Joi.string().min(1)).min(1).optional(),
  }),
};

export const roleSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    display_name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(255).allow('', null).optional(),
  }),
  update: Joi.object({
    display_name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(255).allow('', null).optional(),
  }),
};

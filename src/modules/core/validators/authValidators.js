import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    first_name: Joi.string().min(2).required(),
    last_name: Joi.string().min(2).required(),
    role: Joi.string().valid('admin', 'teacher', 'student', 'librarian', 'user').optional(),
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
    role: Joi.string().valid('admin', 'teacher', 'student', 'librarian', 'user').optional(),
    is_active: Joi.boolean().optional(),
  }),
};

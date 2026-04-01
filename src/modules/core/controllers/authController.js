import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';

export const authController = {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { email, password, first_name, last_name, role = 'user' } = req.body;

      // Check if user exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new AppError('Email already registered', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const result = await query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, role, created_at`,
        [email, hashedPassword, first_name, last_name, role, true]
      );

      const user = result.rows[0];

      // Add to user_roles
      await query(
        'INSERT INTO user_roles (user_id, role_name) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [user.id, role]
      );
      const roles = [role];

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, roles },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      user.roles = roles;
      logger.info('User registered', { userId: user.id, email: user.email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Login user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Find user
      const result = await query(
        `SELECT id, email, password, first_name, last_name, role, is_active
         FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        throw new AppError('Invalid credentials', 401);
      }

      const user = result.rows[0];

      if (!user.is_active) {
        throw new AppError('Account is deactivated', 403);
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new AppError('Invalid credentials', 401);
      }

      // Get all roles for this user
      const userRolesResult = await query(
        'SELECT role_name FROM user_roles WHERE user_id = $1 ORDER BY role_name',
        [user.id]
      );
      const roles = userRolesResult.rows.length > 0
        ? userRolesResult.rows.map(r => r.role_name)
        : [user.role];

      // Generate tokens
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, roles },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
      );

      // Update last login
      await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

      user.roles = roles;
      delete user.password;

      logger.info('User logged in', { userId: user.id, email: user.email });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400);
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Get user
      const result = await query(
        'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      const user = result.rows[0];

      // Get all roles
      const rolesResult = await query(
        'SELECT role_name FROM user_roles WHERE user_id = $1 ORDER BY role_name',
        [decoded.id]
      );
      const roles = rolesResult.rows.length > 0
        ? rolesResult.rows.map(r => r.role_name)
        : [user.role];

      // Generate new access token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role, roles },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        data: { accessToken },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user profile
   */
  async getProfile(req, res, next) {
    try {
      const result = await query(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at, u.last_login,
                COALESCE(
                  (SELECT array_agg(role_name ORDER BY role_name) FROM user_roles WHERE user_id = u.id),
                  ARRAY[u.role]
                ) as roles
         FROM users u WHERE u.id = $1`,
        [req.user.id]
      );

      if (result.rows.length === 0) {
        throw new AppError('User not found', 404);
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(req, res, next) {
    try {
      const { first_name, last_name } = req.body;

      const result = await query(
        `UPDATE users SET first_name = $1, last_name = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING id, email, first_name, last_name, role, updated_at`,
        [first_name, last_name, req.user.id]
      );

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Change password
   */
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get current password
      const result = await query(
        'SELECT password FROM users WHERE id = $1',
        [req.user.id]
      );

      const user = result.rows[0];

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);

      if (!isValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, req.user.id]
      );

      logger.info('Password changed', { userId: req.user.id });

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

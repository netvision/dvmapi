import { query } from '../../../database/connection.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';
import nodemailer from 'nodemailer';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const contactController = {
  /**
   * Submit contact form
   */
  async submitContact(req, res, next) {
    try {
      const { firstName, lastName, email, phone, subject, message } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !subject || !message) {
        throw new AppError('All required fields must be provided', 400);
      }

      // Store in database
      const insertQuery = `
        INSERT INTO contact_messages (first_name, last_name, email, phone, subject, message, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, 'new', NOW())
        RETURNING id, first_name, last_name, email, subject, created_at
      `;

      const result = await query(insertQuery, [
        firstName,
        lastName,
        email,
        phone || null,
        subject,
        message,
      ]);

      const contactMessage = result.rows[0];

      // Send email notification to admin
      try {
        const transporter = createTransporter();
        
        const adminMailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.CONTACT_EMAIL || 'info@dvmchirawa.ac.in',
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Contact Form Submission</h2>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
                <p><strong>Name:</strong> ${firstName} ${lastName}</p>
                <p><strong>Email:</strong> ${email}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                Submitted at: ${new Date(contactMessage.created_at).toLocaleString()}
              </p>
            </div>
          `,
        };

        await transporter.sendMail(adminMailOptions);

        // Send confirmation email to user
        const userMailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email,
          subject: 'Thank you for contacting Dalmia Vidya Mandir',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Thank You for Contacting Us</h2>
              <p>Dear ${firstName} ${lastName},</p>
              <p>We have received your message and will get back to you as soon as possible.</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Your Message:</strong></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              <p>Best regards,<br>Dalmia Vidya Mandir Team</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px;">
                Dalmia Vidya Mandir, Station Road, Chirawa<br>
                Jhunjhunu, Rajasthan - 333026<br>
                Phone: 01596220602 | Email: info@dvmchirawa.ac.in
              </p>
            </div>
          `,
        };

        await transporter.sendMail(userMailOptions);

        logger.info(`Contact form submitted successfully: ${contactMessage.id}`);
      } catch (emailError) {
        logger.error('Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }

      res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon.',
        data: {
          id: contactMessage.id,
          first_name: contactMessage.first_name,
          last_name: contactMessage.last_name,
          email: contactMessage.email,
          subject: contactMessage.subject,
          created_at: contactMessage.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all contact messages (admin only)
   */
  async getAllMessages(req, res, next) {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const offset = (page - 1) * limit;

      let queryText = `
        SELECT id, first_name, last_name, email, phone, subject, message, status, created_at, updated_at
        FROM contact_messages
        WHERE 1=1
      `;
      const params = [];
      let paramCount = 0;

      if (status) {
        paramCount++;
        queryText += ` AND status = $${paramCount}`;
        params.push(status);
      }

      if (search) {
        paramCount++;
        queryText += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR subject ILIKE $${paramCount} OR message ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const result = await query(queryText, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM contact_messages WHERE 1=1';
      const countParams = [];
      let countParamCount = 0;

      if (status) {
        countParamCount++;
        countQuery += ` AND status = $${countParamCount}`;
        countParams.push(status);
      }

      if (search) {
        countParamCount++;
        countQuery += ` AND (first_name ILIKE $${countParamCount} OR last_name ILIKE $${countParamCount} OR email ILIKE $${countParamCount} OR subject ILIKE $${countParamCount} OR message ILIKE $${countParamCount})`;
        countParams.push(`%${search}%`);
      }

      const countResult = await query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        data: result.rows,
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
   * Get single contact message (admin only)
   */
  async getMessage(req, res, next) {
    try {
      const { id } = req.params;

      const result = await query(
        'SELECT * FROM contact_messages WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Contact message not found', 404);
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
   * Update message status (admin only)
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['new', 'read', 'replied', 'archived'].includes(status)) {
        throw new AppError('Invalid status value', 400);
      }

      const result = await query(
        'UPDATE contact_messages SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Contact message not found', 404);
      }

      res.json({
        success: true,
        message: 'Status updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete message (admin only)
   */
  async deleteMessage(req, res, next) {
    try {
      const { id } = req.params;

      const result = await query(
        'DELETE FROM contact_messages WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        throw new AppError('Contact message not found', 404);
      }

      res.json({
        success: true,
        message: 'Contact message deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },
};

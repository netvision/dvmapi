import { upload, getFileUrl } from '../../../shared/utils/fileUpload.js';
import { AppError } from '../../../middleware/errorHandler.js';
import logger from '../../../shared/utils/logger.js';

export const uploadController = {
  /**
   * Upload single file
   */
  uploadSingle: [
    upload.single('file'),
    (req, res, next) => {
      try {
        if (!req.file) {
          throw new AppError('No file uploaded', 400);
        }

        const type = req.query.type || 'general';
        const fileUrl = `/uploads/${type}/${req.file.filename}`;
        const fullUrl = getFileUrl(req, `${type}/${req.file.filename}`);

        logger.info('File uploaded', {
          userId: req.user?.id,
          filename: req.file.filename,
          type: type
        });

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: fileUrl,
            url: fullUrl,
            size: req.file.size,
            mimetype: req.file.mimetype
          }
        });
      } catch (error) {
        next(error);
      }
    }
  ],

  /**
   * Upload multiple files
   */
  uploadMultiple: [
    upload.array('files', 10), // Max 10 files
    (req, res, next) => {
      try {
        if (!req.files || req.files.length === 0) {
          throw new AppError('No files uploaded', 400);
        }

        const type = req.query.type || 'general';
        const files = req.files.map(file => {
          const fileUrl = `/uploads/${type}/${file.filename}`;
          const fullUrl = getFileUrl(req, `${type}/${file.filename}`);
          
          return {
            filename: file.filename,
            originalName: file.originalname,
            path: fileUrl,
            url: fullUrl,
            size: file.size,
            mimetype: file.mimetype
          };
        });

        logger.info('Multiple files uploaded', {
          userId: req.user?.id,
          count: files.length,
          type: type
        });

        res.json({
          success: true,
          message: `${files.length} file(s) uploaded successfully`,
          data: files
        });
      } catch (error) {
        next(error);
      }
    }
  ]
};

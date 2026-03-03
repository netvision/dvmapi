import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AppError } from '../../middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subDir = req.query.type || 'general'; // news, events, general, etc.
    const targetDir = path.join(uploadsDir, subDir);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter - allow images, videos, PDFs, and spreadsheets
const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideos = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  const allowedDocs   = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel',                                           // .xls
  ];

  if (allowedImages.includes(file.mimetype) ||
      allowedVideos.includes(file.mimetype) ||
      allowedDocs.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only image, video, PDF or Excel files are allowed', 400), false);
  }
};

// Configure multer — 100 MB limit to accommodate video uploads
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100 MB
  }
});

// Helper to delete file
export const deleteFile = (filePath) => {
  try {
    const fullPath = path.join(uploadsDir, filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper to get file URL
export const getFileUrl = (req, filePath) => {
  // Check for forwarded protocol (from reverse proxy like Nginx)
  const forwardedProto = req.get('x-forwarded-proto');
  // Use environment variable to force HTTPS in production, or detect from headers
  const protocol = process.env.FORCE_HTTPS === 'true' ? 'https' : (forwardedProto || req.protocol);
  const host = req.get('host');
  return `${protocol}://${host}/uploads/${filePath}`;
};

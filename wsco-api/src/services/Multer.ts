import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Verwende memoryStorage für S3-Uploads
const storage = multer.memoryStorage();

// File-Filter: Erlaube nur Bilder
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Nur Bilder erlaubt!'));
  }
};

// Exportiere Middleware-Instance
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB Limit
  fileFilter,
});

export default upload;

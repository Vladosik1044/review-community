import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { HttpError } from '../middleware/errorHandler';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 МБ

export function validateFile(file: Express.Multer.File) {
  if (!file) throw new HttpError(400, 'Файл не загружен');

  if (file.size > MAX_SIZE) {
    throw new HttpError(413, 'Файл больше 5 МБ');
  }

  if (!ALLOWED_MIME.includes(file.mimetype)) {
    throw new HttpError(400, 'Недопустимый тип файла. Разрешены JPG, PNG, WEBP');
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    throw new HttpError(400, 'Недопустимое расширение файла');
  }

  return ext;
}

export function saveCover(file: Express.Multer.File) {
  const ext = validateFile(file);

  const filename = crypto.randomBytes(16).toString('hex') + ext;
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const filepath = path.join(uploadsDir, filename);

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  fs.writeFileSync(filepath, file.buffer);

  return { url: `/uploads/${filename}` };
}
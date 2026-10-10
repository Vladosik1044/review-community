import { Router } from 'express';
import multer from 'multer';
import { uploadCover } from '../controllers/uploadController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/cover',
  requireAuth,
  requireRole('ADMIN'),
  upload.single('file'),
  uploadCover
);

export default router;
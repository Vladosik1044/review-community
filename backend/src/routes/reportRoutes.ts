import { Router } from 'express';
import { list, setStatus } from '../controllers/reportController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, requireRole('MODERATOR', 'ADMIN'), list);
router.patch('/:id', requireAuth, requireRole('MODERATOR', 'ADMIN'), setStatus);

export default router;
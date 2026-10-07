import { Router } from 'express';
import { getOne, update, remove, setStatus } from '../controllers/reviewController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/:id', getOne);
router.patch('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);
router.patch('/:id/status', requireAuth, requireRole('MODERATOR', 'ADMIN'), setStatus);

export default router;
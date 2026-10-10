import { Router } from 'express';
import { remove } from '../controllers/commentController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.delete('/:id', requireAuth, remove);

export default router;
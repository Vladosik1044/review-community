import { Router } from 'express';
import { getOne, update, remove, setStatus } from '../controllers/reviewController';
import { create as createComment, list as listComments } from '../controllers/commentController';
import { create as createReport } from '../controllers/reportController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/:id', getOne);
router.patch('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);
router.patch('/:id/status', requireAuth, requireRole('MODERATOR', 'ADMIN'), setStatus);

router.get('/:id/comments', listComments);
router.post('/:id/comments', requireAuth, createComment);

router.post('/:id/reports', requireAuth, createReport);

export default router;
import { Router } from 'express';
import { getWorks, getWork } from '../controllers/workController';
import { upsertRating, removeRating } from '../controllers/ratingController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getWorks);
router.get('/:id', getWork);

router.post('/:id/ratings', requireAuth, upsertRating);
router.delete('/:id/ratings', requireAuth, removeRating);

export default router;
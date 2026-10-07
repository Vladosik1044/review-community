import { Router } from 'express';
import { getWorks, getWork } from '../controllers/workController';
import { upsertRating, removeRating } from '../controllers/ratingController';
import { create, listByWork } from '../controllers/reviewController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getWorks);
router.get('/:id', getWork);
router.get('/:id/reviews', listByWork);
router.post('/:id/reviews', requireAuth, create);

router.post('/:id/ratings', requireAuth, upsertRating);
router.delete('/:id/ratings', requireAuth, removeRating);

export default router;
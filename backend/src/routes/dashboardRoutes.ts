import { Router } from 'express';
import { stats } from '../controllers/dashboardController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, requireRole('MODERATOR', 'ADMIN'), stats);

export default router;
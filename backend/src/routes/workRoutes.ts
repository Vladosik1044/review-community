import { Router } from 'express';
import { getWorks, getWork } from '../controllers/workController';

const router = Router();

router.get('/', getWorks);
router.get('/:id', getWork);

export default router;
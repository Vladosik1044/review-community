import { Router } from 'express';
import {
  create,
  my,
  publicLists,
  getOne,
  update,
  remove,
  addWork,
  patchItem,
  deleteItem,
} from '../controllers/listController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/public', publicLists);
router.get('/my', requireAuth, my);
router.post('/', requireAuth, create);

router.get('/:id', getOne);
router.patch('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

router.post('/:id/items', requireAuth, addWork);
router.patch('/:id/items/:itemId', requireAuth, patchItem);
router.delete('/:id/items/:itemId', requireAuth, deleteItem);

export default router;
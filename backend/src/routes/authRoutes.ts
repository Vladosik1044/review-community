import { Router } from 'express';
import {
  register,
  login,
  questions,
  forgotPassword,
  resetPasswordHandler,
  changePasswordHandler,
} from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/questions', questions);
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordHandler);
router.patch('/password', requireAuth, changePasswordHandler);

export default router;
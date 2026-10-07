import { Response, NextFunction } from 'express';
import { setRating, deleteRating } from '../services/ratingService';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export async function upsertRating(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const workId = Number(req.params.id);
    const value = Number(req.body.value);

    if (!Number.isInteger(workId) || workId < 1) {
      throw new HttpError(400, 'Некорректный id произведения');
    }

    const result = await setRating(req.user!.userId, workId, value);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function removeRating(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const workId = Number(req.params.id);

    if (!Number.isInteger(workId) || workId < 1) {
      throw new HttpError(400, 'Некорректный id произведения');
    }

    const result = await deleteRating(req.user!.userId, workId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
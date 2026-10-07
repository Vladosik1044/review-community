import { Request, Response, NextFunction } from 'express';
import {
  createReview,
  listReviews,
  getReviewById,
  updateReview,
  deleteReview,
  changeReviewStatus,
} from '../services/reviewService';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const workId = Number(req.params.id);
    if (!Number.isInteger(workId) || workId < 1) {
      throw new HttpError(400, 'Некорректный id произведения');
    }
    const { text, hasSpoiler } = req.body;
    const review = await createReview(req.user!.userId, workId, text, hasSpoiler);
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

export async function listByWork(req: Request, res: Response, next: NextFunction) {
  try {
    const workId = Number(req.params.id);
    if (!Number.isInteger(workId) || workId < 1) {
      throw new HttpError(400, 'Некорректный id произведения');
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const result = await listReviews(workId, page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(400, 'Некорректный id');
    }
    const review = await getReviewById(id);
    res.json(review);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(400, 'Некорректный id');
    }
    const { text, hasSpoiler } = req.body;
    const review = await updateReview(req.user!.userId, req.user!.role, id, text, hasSpoiler);
    res.json(review);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(400, 'Некорректный id');
    }
    const result = await deleteReview(req.user!.userId, req.user!.role, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function setStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(400, 'Некорректный id');
    }
    const { status } = req.body;
    const result = await changeReviewStatus(id, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
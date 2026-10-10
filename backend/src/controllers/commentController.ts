import { Request, Response, NextFunction } from 'express';
import { createComment, listComments, deleteComment } from '../services/commentService';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';

function parseId(value: unknown, field = 'id'): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new HttpError(400, `Некорректный ${field}`);
  }
  return id;
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const reviewId = parseId(req.params.id, 'reviewId');
    const { text } = req.body;
    const comment = await createComment(req.user!.userId, reviewId, text);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const reviewId = parseId(req.params.id, 'reviewId');
    const comments = await listComments(reviewId);
    res.json({ comments });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    const result = await deleteComment(req.user!.userId, req.user!.role, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
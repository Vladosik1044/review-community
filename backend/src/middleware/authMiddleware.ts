import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: { userId: number; role: string };
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Требуется авторизация'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { userId: number; role: string };
    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, 'Недействительный токен'));
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'Требуется авторизация'));
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Недостаточно прав'));
    }
    next();
  };
}
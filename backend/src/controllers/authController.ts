import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/authService';
import { HttpError } from '../middleware/errorHandler';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      throw new HttpError(400, 'Все поля обязательны');
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new HttpError(400, 'Некорректный email');
    }
    if (typeof username !== 'string' || username.length < 3) {
      throw new HttpError(400, 'Username минимум 3 символа');
    }
    if (typeof password !== 'string' || password.length < 6) {
      throw new HttpError(400, 'Пароль минимум 6 символов');
    }

    const result = await registerUser(email.toLowerCase(), username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new HttpError(400, 'Email и пароль обязательны');
    }

    const result = await loginUser(email.toLowerCase(), password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
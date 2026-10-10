import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  getSecurityQuestion,
  resetPassword,
  changePassword,
  SECURITY_QUESTIONS,
} from '../services/authService';
import { HttpError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authMiddleware';

export function questions(_req: Request, res: Response) {
  res.json({ questions: SECURITY_QUESTIONS });
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, username, password, securityQuestion, securityAnswer } = req.body;

    if (!email || !username || !password || !securityQuestion || !securityAnswer) {
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
    if (!SECURITY_QUESTIONS.includes(securityQuestion)) {
      throw new HttpError(400, 'Недопустимый вопрос безопасности');
    }
    if (typeof securityAnswer !== 'string' || securityAnswer.trim().length < 2) {
      throw new HttpError(400, 'Ответ минимум 2 символа');
    }

    const result = await registerUser(
      email.toLowerCase(),
      username,
      password,
      securityQuestion,
      securityAnswer
    );
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

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email) throw new HttpError(400, 'Email обязателен');
    const result = await getSecurityQuestion(email.toLowerCase());
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPasswordHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, answer, newPassword } = req.body;
    if (!email || !answer || !newPassword) {
      throw new HttpError(400, 'Все поля обязательны');
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new HttpError(400, 'Пароль минимум 6 символов');
    }
    const result = await resetPassword(email.toLowerCase(), answer, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function changePasswordHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new HttpError(400, 'Оба пароля обязательны');
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      throw new HttpError(400, 'Пароль минимум 6 символов');
    }
    const result = await changePassword(req.user!.userId, oldPassword, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
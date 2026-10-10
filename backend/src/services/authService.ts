import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';

export const SECURITY_QUESTIONS = [
  'Девичья фамилия матери?',
  'Название первой школы?',
  'Кличка первого питомца?',
  'Город, где вы родились?',
  'Ваше любимое блюдо в детстве?',
];

function signToken(userId: number, role: string) {
  return jwt.sign({ userId, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
}

export async function registerUser(
  email: string,
  username: string,
  password: string,
  securityQuestion: string,
  securityAnswer: string
) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) throw new HttpError(409, 'Email или username уже заняты');

  const passwordHash = await bcrypt.hash(password, 10);
  const securityAnswerHash = await bcrypt.hash(securityAnswer.toLowerCase().trim(), 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      securityQuestion,
      securityAnswerHash,
      role: 'USER',
    },
  });

  const token = signToken(user.id, user.role);

  return {
    token,
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(401, 'Неверный email или пароль');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new HttpError(401, 'Неверный email или пароль');

  const token = signToken(user.id, user.role);

  return {
    token,
    user: { id: user.id, email: user.email, username: user.username, role: user.role },
  };
}

export async function getSecurityQuestion(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(404, 'Пользователь не найден');

  return { question: user.securityQuestion };
}

export async function resetPassword(email: string, answer: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(404, 'Пользователь не найден');

  const valid = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswerHash);
  if (!valid) throw new HttpError(401, 'Неверный ответ');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}

export async function changePassword(userId: number, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'Пользователь не найден');

  const valid = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!valid) throw new HttpError(401, 'Неверный старый пароль');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}
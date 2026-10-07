import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

async function getWorkRatingStats(workId: number, userId?: number) {
  const ratings = await prisma.rating.findMany({
    where: { workId },
    select: { value: true, userId: true },
  });

  const values = ratings.map((r) => r.value);
  const avgRating = values.length
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    : 0;

  const userRating = userId
    ? ratings.find((r) => r.userId === userId)?.value ?? null
    : null;

  return { avgRating, ratingsCount: values.length, userRating };
}

export async function setRating(userId: number, workId: number, value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 10) {
    throw new HttpError(400, 'Оценка должна быть целым числом от 1 до 10');
  }

  const work = await prisma.work.findUnique({ where: { id: workId } });
  if (!work) throw new HttpError(404, 'Произведение не найдено');

  await prisma.rating.upsert({
    where: { userId_workId: { userId, workId } },
    update: { value },
    create: { userId, workId, value },
  });

  return getWorkRatingStats(workId, userId);
}

export async function deleteRating(userId: number, workId: number) {
  const existing = await prisma.rating.findUnique({
    where: { userId_workId: { userId, workId } },
  });
  if (!existing) throw new HttpError(404, 'Оценка не найдена');

  await prisma.rating.delete({
    where: { userId_workId: { userId, workId } },
  });

  return getWorkRatingStats(workId, userId);
}
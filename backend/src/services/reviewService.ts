import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function createReview(userId: number, workId: number, text: string, hasSpoiler: boolean) {
  if (typeof text !== 'string' || text.trim().length < 20) {
    throw new HttpError(400, 'Текст рецензии минимум 20 символов');
  }
  if (text.length > 5000) {
    throw new HttpError(400, 'Текст рецензии максимум 5000 символов');
  }

  const work = await prisma.work.findUnique({ where: { id: workId } });
  if (!work) throw new HttpError(404, 'Произведение не найдено');

  const review = await prisma.review.create({
    data: {
      title: '',
      text: text.trim(),
      hasSpoiler: Boolean(hasSpoiler),
      status: 'PUBLISHED',
      userId,
      workId,
    },
    include: {
      user: { select: { id: true, username: true } },
    },
  });

  return {
    id: review.id,
    text: review.text,
    hasSpoiler: review.hasSpoiler,
    status: review.status,
    likes: review.likes,
    createdAt: review.createdAt,
    author: { id: review.user.id, username: review.user.username },
  };
}

export async function listReviews(workId: number, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { workId, status: 'PUBLISHED' },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true } },
      },
    }),
    prisma.review.count({ where: { workId, status: 'PUBLISHED' } }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      text: r.text,
      hasSpoiler: r.hasSpoiler,
      likes: r.likes,
      createdAt: r.createdAt,
      author: { id: r.user.id, username: r.user.username },
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getReviewById(id: number) {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true } },
      work: { select: { id: true, title: true } },
    },
  });

  if (!review) throw new HttpError(404, 'Рецензия не найдена');

  return {
    id: review.id,
    text: review.text,
    hasSpoiler: review.hasSpoiler,
    status: review.status,
    likes: review.likes,
    createdAt: review.createdAt,
    author: { id: review.user.id, username: review.user.username },
    work: { id: review.work.id, title: review.work.title },
  };
}

export async function updateReview(userId: number, role: string, reviewId: number, text: string, hasSpoiler: boolean) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new HttpError(404, 'Рецензия не найдена');

  if (review.userId !== userId && role !== 'ADMIN' && role !== 'MODERATOR') {
    throw new HttpError(403, 'Можно редактировать только свои рецензии');
  }

  if (typeof text !== 'string' || text.trim().length < 20) {
    throw new HttpError(400, 'Текст рецензии минимум 20 символов');
  }
  if (text.length > 5000) {
    throw new HttpError(400, 'Текст рецензии максимум 5000 символов');
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { text: text.trim(), hasSpoiler: Boolean(hasSpoiler) },
    include: {
      user: { select: { id: true, username: true } },
    },
  });

  return {
    id: updated.id,
    text: updated.text,
    hasSpoiler: updated.hasSpoiler,
    status: updated.status,
    likes: updated.likes,
    createdAt: updated.createdAt,
    author: { id: updated.user.id, username: updated.user.username },
  };
}

export async function deleteReview(userId: number, role: string, reviewId: number) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new HttpError(404, 'Рецензия не найдена');

  if (review.userId !== userId && role !== 'ADMIN') {
    throw new HttpError(403, 'Можно удалять только свои рецензии');
  }

  await prisma.review.delete({ where: { id: reviewId } });
  return { success: true };
}

export async function changeReviewStatus(reviewId: number, status: string) {
  if (!['PUBLISHED', 'HIDDEN', 'REJECTED'].includes(status)) {
    throw new HttpError(400, 'Недопустимый статус');
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new HttpError(404, 'Рецензия не найдена');

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { status: status as any },
  });

  return { id: updated.id, status: updated.status };
}
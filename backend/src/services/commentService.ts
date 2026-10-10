import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function createComment(userId: number, reviewId: number, text: string) {
  if (typeof text !== 'string' || text.trim().length < 2) {
    throw new HttpError(400, 'Комментарий минимум 2 символа');
  }
  if (text.length > 1000) {
    throw new HttpError(400, 'Комментарий максимум 1000 символов');
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new HttpError(404, 'Рецензия не найдена');
  if (review.status !== 'PUBLISHED') {
    throw new HttpError(400, 'Нельзя комментировать скрытую рецензию');
  }

  const comment = await prisma.comment.create({
    data: { text: text.trim(), userId, reviewId },
    include: { user: { select: { id: true, username: true } } },
  });

  return {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt,
    author: { id: comment.user.id, username: comment.user.username },
  };
}

export async function listComments(reviewId: number) {
  const comments = await prisma.comment.findMany({
    where: { reviewId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, username: true } } },
  });

  return comments.map((c) => ({
    id: c.id,
    text: c.text,
    createdAt: c.createdAt,
    author: { id: c.user.id, username: c.user.username },
  }));
}

export async function deleteComment(userId: number, role: string, commentId: number) {
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) throw new HttpError(404, 'Комментарий не найден');

  if (comment.userId !== userId && role !== 'ADMIN' && role !== 'MODERATOR') {
    throw new HttpError(403, 'Можно удалять только свои комментарии');
  }

  await prisma.comment.delete({ where: { id: commentId } });
  return { success: true };
}
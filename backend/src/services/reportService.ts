import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

export async function createReport(userId: number, reviewId: number, reason: string) {
  if (typeof reason !== 'string' || reason.trim().length < 5) {
    throw new HttpError(400, 'Причина жалобы минимум 5 символов');
  }
  if (reason.length > 500) {
    throw new HttpError(400, 'Причина жалобы максимум 500 символов');
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new HttpError(404, 'Рецензия не найдена');

  if (review.userId === userId) {
    throw new HttpError(400, 'Нельзя жаловаться на свою рецензию');
  }

  const existing = await prisma.report.findFirst({
    where: { userId, reviewId },
  });
  if (existing) throw new HttpError(409, 'Вы уже жаловались на эту рецензию');

  const report = await prisma.report.create({
    data: { reason: reason.trim(), userId, reviewId },
  });

  return { id: report.id, reason: report.reason, status: report.status, createdAt: report.createdAt };
}

export async function listReports(status?: string) {
  const where: any = {};
  if (status && ['OPEN', 'RESOLVED', 'REJECTED'].includes(status)) {
    where.status = status;
  }

  const reports = await prisma.report.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true } },
      review: {
        select: {
          id: true,
          text: true,
          status: true,
          user: { select: { id: true, username: true } },
        },
      },
    },
  });

  return reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    status: r.status,
    createdAt: r.createdAt,
    reporter: { id: r.user.id, username: r.user.username },
    review: {
      id: r.review.id,
      text: r.review.text,
      status: r.review.status,
      author: { id: r.review.user.id, username: r.review.user.username },
    },
  }));
}

export async function updateReportStatus(reportId: number, status: string) {
  if (!['OPEN', 'RESOLVED', 'REJECTED'].includes(status)) {
    throw new HttpError(400, 'Недопустимый статус');
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) throw new HttpError(404, 'Жалоба не найдена');

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: status as any },
  });

  return { id: updated.id, status: updated.status };
}
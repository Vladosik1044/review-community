import { Request, Response, NextFunction } from 'express';
import { createReport, listReports, updateReportStatus } from '../services/reportService';
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
    const { reason } = req.body;
    const report = await createReport(req.user!.userId, reviewId, reason);
    res.status(201).json(report);
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string | undefined;
    const reports = await listReports(status);
    res.json({ reports });
  } catch (err) {
    next(err);
  }
}

export async function setStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    const { status } = req.body;
    const result = await updateReportStatus(id, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
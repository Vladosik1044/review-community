import { Request, Response, NextFunction } from 'express';
import { getStats } from '../services/dashboardService';

export async function stats(_req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getStats();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
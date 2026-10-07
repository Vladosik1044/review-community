import { Request, Response, NextFunction } from 'express';
import { listWorks, getWorkById } from '../services/workService';
import { HttpError } from '../middleware/errorHandler';

export async function getWorks(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listWorks({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: req.query.search as string | undefined,
      type: req.query.type as string | undefined,
      genre: req.query.genre as string | undefined,
      yearFrom: req.query.yearFrom ? Number(req.query.yearFrom) : undefined,
      yearTo: req.query.yearTo ? Number(req.query.yearTo) : undefined,
      sort: req.query.sort as string | undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getWork(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      throw new HttpError(400, 'Некорректный id');
    }
    const work = await getWorkById(id);
    res.json(work);
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from 'express';
import { saveCover } from '../services/uploadService';

export async function uploadCover(req: Request, res: Response, next: NextFunction) {
  try {
    const result = saveCover(req.file as Express.Multer.File);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
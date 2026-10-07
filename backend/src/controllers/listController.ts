import { Request, Response, NextFunction } from 'express';
import {
  createList,
  getMyLists,
  getPublicLists,
  getListById,
  updateList,
  deleteList,
  addItem,
  updateItem,
  removeItem,
} from '../services/listService';
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
    const { name, isPublic } = req.body;
    const list = await createList(req.user!.userId, name, isPublic);
    res.status(201).json(list);
  } catch (err) {
    next(err);
  }
}

export async function my(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const lists = await getMyLists(req.user!.userId);
    res.json({ lists });
  } catch (err) {
    next(err);
  }
}

export async function publicLists(_req: Request, res: Response, next: NextFunction) {
  try {
    const lists = await getPublicLists();
    res.json({ lists });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    const list = await getListById(id, req.user?.userId);
    res.json(list);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    const { name, isPublic } = req.body;
    const result = await updateList(req.user!.userId, id, name, isPublic);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseId(req.params.id);
    const result = await deleteList(req.user!.userId, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addWork(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const listId = parseId(req.params.id, 'listId');
    const { workId, status } = req.body;
    const workNum = Number(workId);
    if (!Number.isInteger(workNum) || workNum < 1) {
      throw new HttpError(400, 'Некорректный workId');
    }
    const item = await addItem(req.user!.userId, listId, workNum, status);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

export async function patchItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const listId = parseId(req.params.id, 'listId');
    const itemId = parseId(req.params.itemId, 'itemId');
    const { status } = req.body;
    const result = await updateItem(req.user!.userId, listId, itemId, status);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const listId = parseId(req.params.id, 'listId');
    const itemId = parseId(req.params.itemId, 'itemId');
    const result = await removeItem(req.user!.userId, listId, itemId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
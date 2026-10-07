import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

function validateName(name: string) {
  if (typeof name !== 'string' || name.trim().length < 1) {
    throw new HttpError(400, 'Название списка обязательно');
  }
  if (name.length > 100) {
    throw new HttpError(400, 'Название списка максимум 100 символов');
  }
  return name.trim();
}

function validateStatus(status: string) {
  if (!['WANT', 'IN_PROGRESS', 'DONE'].includes(status)) {
    throw new HttpError(400, 'Недопустимый статус');
  }
  return status as 'WANT' | 'IN_PROGRESS' | 'DONE';
}

export async function createList(userId: number, name: string, isPublic: boolean) {
  const cleanName = validateName(name);

  const list = await prisma.list.create({
    data: {
      name: cleanName,
      isPublic: isPublic !== false,
      userId,
    },
  });

  return { id: list.id, name: list.name, isPublic: list.isPublic, itemsCount: 0 };
}

export async function getMyLists(userId: number) {
  const lists = await prisma.list.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { items: true } } },
  });

  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    isPublic: l.isPublic,
    itemsCount: l._count.items,
    createdAt: l.createdAt,
  }));
}

export async function getPublicLists() {
  const lists = await prisma.list.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
    include: {
      user: { select: { id: true, username: true } },
      _count: { select: { items: true } },
    },
  });

  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    itemsCount: l._count.items,
    author: { id: l.user.id, username: l.user.username },
  }));
}

export async function getListById(id: number, userId?: number) {
  const list = await prisma.list.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true } },
      items: {
        orderBy: { createdAt: 'desc' },
        include: {
          work: {
            include: {
              genres: { include: { genre: true } },
              ratings: { select: { value: true } },
            },
          },
        },
      },
    },
  });

  if (!list) throw new HttpError(404, 'Список не найден');
  if (!list.isPublic && list.userId !== userId) {
    throw new HttpError(403, 'Нет доступа к этому списку');
  }

  return {
    id: list.id,
    name: list.name,
    isPublic: list.isPublic,
    author: { id: list.user.id, username: list.user.username },
    items: list.items.map((item) => {
      const values = item.work.ratings.map((r) => r.value);
      const avgRating = values.length
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;
      return {
        id: item.id,
        status: item.status,
        work: {
          id: item.work.id,
          title: item.work.title,
          type: item.work.type,
          releaseYear: item.work.releaseYear,
          coverUrl: item.work.coverUrl,
          genres: item.work.genres.map((g) => ({ name: g.genre.name, slug: g.genre.slug })),
          avgRating,
        },
      };
    }),
  };
}

export async function updateList(userId: number, listId: number, name?: string, isPublic?: boolean) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw new HttpError(404, 'Список не найден');
  if (list.userId !== userId) throw new HttpError(403, 'Это не ваш список');

  const data: any = {};
  if (name !== undefined) data.name = validateName(name);
  if (isPublic !== undefined) data.isPublic = Boolean(isPublic);

  const updated = await prisma.list.update({
    where: { id: listId },
    data,
  });

  return { id: updated.id, name: updated.name, isPublic: updated.isPublic };
}

export async function deleteList(userId: number, listId: number) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw new HttpError(404, 'Список не найден');
  if (list.userId !== userId) throw new HttpError(403, 'Это не ваш список');

  await prisma.list.delete({ where: { id: listId } });
  return { success: true };
}

export async function addItem(userId: number, listId: number, workId: number, status: string) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw new HttpError(404, 'Список не найден');
  if (list.userId !== userId) throw new HttpError(403, 'Это не ваш список');

  const work = await prisma.work.findUnique({ where: { id: workId } });
  if (!work) throw new HttpError(404, 'Произведение не найдено');

  const existing = await prisma.listItem.findUnique({
    where: { listId_workId: { listId, workId } },
  });
  if (existing) throw new HttpError(409, 'Произведение уже в списке');

  const item = await prisma.listItem.create({
    data: { listId, workId, status: validateStatus(status) },
  });

  return { id: item.id, workId: item.workId, status: item.status };
}

export async function updateItem(userId: number, listId: number, itemId: number, status: string) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw new HttpError(404, 'Список не найден');
  if (list.userId !== userId) throw new HttpError(403, 'Это не ваш список');

  const item = await prisma.listItem.findUnique({ where: { id: itemId } });
  if (!item || item.listId !== listId) throw new HttpError(404, 'Позиция не найдена');

  const updated = await prisma.listItem.update({
    where: { id: itemId },
    data: { status: validateStatus(status) },
  });

  return { id: updated.id, workId: updated.workId, status: updated.status };
}

export async function removeItem(userId: number, listId: number, itemId: number) {
  const list = await prisma.list.findUnique({ where: { id: listId } });
  if (!list) throw new HttpError(404, 'Список не найден');
  if (list.userId !== userId) throw new HttpError(403, 'Это не ваш список');

  const item = await prisma.listItem.findUnique({ where: { id: itemId } });
  if (!item || item.listId !== listId) throw new HttpError(404, 'Позиция не найдена');

  await prisma.listItem.delete({ where: { id: itemId } });
  return { success: true };
}
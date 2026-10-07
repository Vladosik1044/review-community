import { prisma } from '../utils/prisma';
import { HttpError } from '../middleware/errorHandler';

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  genre?: string;
  yearFrom?: number;
  yearTo?: number;
  sort?: string;
}

export async function listWorks(params: ListParams) {
  const page = Math.max(1, Number(params.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(params.limit) || 6));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { originalTitle: { contains: params.search, mode: 'insensitive' } },
      { creator: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  if (params.type) {
    if (!['BOOK', 'MOVIE', 'GAME'].includes(params.type)) {
      throw new HttpError(400, 'Недопустимый тип произведения');
    }
    where.type = params.type;
  }

  if (params.genre) {
    where.genres = { some: { genre: { slug: params.genre } } };
  }

  if (params.yearFrom || params.yearTo) {
    where.releaseYear = {};
    if (params.yearFrom) where.releaseYear.gte = Number(params.yearFrom);
    if (params.yearTo) where.releaseYear.lte = Number(params.yearTo);
  }

  let orderBy: any = { createdAt: 'desc' };
  if (params.sort === 'year') orderBy = { releaseYear: 'desc' };
  if (params.sort === 'title') orderBy = { title: 'asc' };

  const [works, total] = await Promise.all([
    prisma.work.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        genres: { include: { genre: true } },
        ratings: { select: { value: true } },
      },
    }),
    prisma.work.count({ where }),
  ]);

  const worksWithRating = works.map((w) => {
    const values = w.ratings.map((r) => r.value);
    const avgRating = values.length
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : 0;

    return {
      id: w.id,
      title: w.title,
      originalTitle: w.originalTitle,
      type: w.type,
      releaseYear: w.releaseYear,
      duration: w.duration,
      pages: w.pages,
      coverUrl: w.coverUrl,
      creator: w.creator,
      genres: w.genres.map((g) => ({ name: g.genre.name, slug: g.genre.slug })),
      avgRating,
      ratingsCount: values.length,
    };
  });

  if (params.sort === 'rating') {
    worksWithRating.sort((a, b) => b.avgRating - a.avgRating);
  }

  return {
    works: worksWithRating,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getWorkById(id: number) {
  const work = await prisma.work.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      ratings: { select: { value: true } },
      reviews: {
        where: { status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, username: true } },
        },
      },
    },
  });

  if (!work) throw new HttpError(404, 'Произведение не найдено');

  const values = work.ratings.map((r) => r.value);
  const avgRating = values.length
    ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
    : 0;

  return {
    id: work.id,
    title: work.title,
    originalTitle: work.originalTitle,
    description: work.description,
    type: work.type,
    releaseYear: work.releaseYear,
    duration: work.duration,
    pages: work.pages,
    coverUrl: work.coverUrl,
    creator: work.creator,
    genres: work.genres.map((g) => ({ name: g.genre.name, slug: g.genre.slug })),
    avgRating,
    ratingsCount: values.length,
    recentReviews: work.reviews.map((r) => ({
      id: r.id,
      title: r.title,
      text: r.text,
      hasSpoiler: r.hasSpoiler,
      likes: r.likes,
      createdAt: r.createdAt,
      author: { id: r.user.id, username: r.user.username },
    })),
  };
}
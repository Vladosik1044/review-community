import { prisma } from '../utils/prisma';

export async function getStats() {
  const [
    usersCount,
    worksCount,
    reviewsCount,
    publishedReviewsCount,
    pendingReviewsCount,
    ratingsCount,
    reportsOpenCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.work.count(),
    prisma.review.count(),
    prisma.review.count({ where: { status: 'PUBLISHED' } }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.rating.count(),
    prisma.report.count({ where: { status: 'OPEN' } }),
  ]);

  const avgResult = await prisma.rating.aggregate({
    _avg: { value: true },
  });
  const avgRating = avgResult._avg.value
    ? Math.round(avgResult._avg.value * 10) / 10
    : 0;

  const topWorksRaw = await prisma.work.findMany({
    take: 5,
    include: {
      ratings: { select: { value: true } },
      genres: { include: { genre: true } },
    },
  });

  const topWorks = topWorksRaw
    .map((w) => {
      const values = w.ratings.map((r) => r.value);
      const avg = values.length
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : 0;
      return {
        id: w.id,
        title: w.title,
        type: w.type,
        coverUrl: w.coverUrl,
        avgRating: avg,
        ratingsCount: values.length,
      };
    })
    .filter((w) => w.ratingsCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, 5);

  const recentReviews = await prisma.review.findMany({
    where: { status: 'PUBLISHED' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, username: true } },
      work: { select: { id: true, title: true } },
    },
  });

  return {
    totals: {
      users: usersCount,
      works: worksCount,
      reviews: reviewsCount,
      reviewsPublished: publishedReviewsCount,
      reviewsPending: pendingReviewsCount,
      ratings: ratingsCount,
      reportsOpen: reportsOpenCount,
    },
    avgRating,
    topWorks,
    recentReviews: recentReviews.map((r) => ({
      id: r.id,
      text: r.text.slice(0, 120) + (r.text.length > 120 ? '…' : ''),
      createdAt: r.createdAt,
      author: { id: r.user.id, username: r.user.username },
      work: { id: r.work.id, title: r.work.title },
    })),
  };
}
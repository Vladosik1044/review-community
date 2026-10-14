import api from './client';
import type { Genre } from './works';

export interface Review {
  id: number;
  title: string;
  text: string;
  hasSpoiler: boolean;
  likes: number;
  createdAt: string;
  author: {
    id: number;
    username: string;
  };
}

export interface WorkDetail {
  id: number;
  title: string;
  originalTitle: string | null;
  description: string | null;
  type: 'BOOK' | 'MOVIE' | 'GAME';
  releaseYear: number | null;
  duration: number | null;
  pages: number | null;
  coverUrl: string | null;
  creator: string | null;
  genres: Genre[];
  avgRating: number;
  ratingsCount: number;
  recentReviews: Review[];
}

export async function fetchWork(id: number): Promise<WorkDetail> {
  const res = await api.get<WorkDetail>(`/works/${id}`);
  return res.data;
}

export async function fetchWorkReviews(id: number, page = 1, limit = 5) {
  const res = await api.get(`/works/${id}/reviews`, { params: { page, limit } });
  return res.data;
}
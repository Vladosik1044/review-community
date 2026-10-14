import api from './client';

export interface Genre {
  name: string;
  slug: string;
}

export interface Work {
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
}

export interface WorksResponse {
  works: Work[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorksParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  genre?: string;
  sort?: string;
}

export async function fetchWorks(params: WorksParams = {}): Promise<WorksResponse> {
  const res = await api.get<WorksResponse>('/works', { params });
  return res.data;
}
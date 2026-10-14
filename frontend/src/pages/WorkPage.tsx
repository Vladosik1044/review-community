import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fetchWork } from '../api/work';
import type { WorkDetail } from '../api/work';
import ReviewItem from '../components/ReviewItem';

const typeLabels: Record<string, string> = {
  BOOK: 'Книга',
  MOVIE: 'Фильм',
  GAME: 'Игра',
};

export default function WorkPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<WorkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchWork(Number(id))
      .then(setWork)
      .catch(() => setError('Не удалось загрузить произведение'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleAuthRequired() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }

  if (loading) return <div className="page"><p>Загрузка...</p></div>;
  if (error) return <div className="page"><p>{error}</p></div>;
  if (!work) return <div className="page"><p>Произведение не найдено</p></div>;

  const stars = '★'.repeat(Math.round(work.avgRating / 2)) + '☆'.repeat(5 - Math.round(work.avgRating / 2));

  return (
    <div className="page">
      <Link to="/" className="work-back">← Назад к каталогу</Link>

      <div className="work-detail">
        <div className="work-detail__cover">
          {work.coverUrl ? (
            <img src={work.coverUrl} alt={work.title} />
          ) : (
            <div className="work-detail__placeholder">{work.title[0]}</div>
          )}
        </div>

        <div className="work-detail__info">
          <h1 className="work-detail__title">{work.title}</h1>
          {work.originalTitle && (
            <p className="work-detail__original">{work.originalTitle}</p>
          )}

          <p className="work-detail__meta">
            {typeLabels[work.type]}
            {work.releaseYear && ` · ${work.releaseYear}`}
            {work.duration && ` · ${work.duration} мин`}
            {work.pages && ` · ${work.pages} стр`}
          </p>

          {work.creator && (
            <p className="work-detail__creator">Автор: {work.creator}</p>
          )}

          {work.genres.length > 0 && (
            <p className="work-detail__genres">
              Жанры: {work.genres.map((g) => g.name).join(' · ')}
            </p>
          )}

          <div className="work-detail__rating">
            <span className="work-detail__stars">{stars}</span>
            <span className="work-detail__score">
              {work.avgRating > 0 ? work.avgRating.toFixed(1) : '—'}
            </span>
            <span className="work-detail__count">
              {work.ratingsCount} {work.ratingsCount === 1 ? 'оценка' : 'оценок'}
            </span>
          </div>

          <div className="work-detail__actions">
            <button className="btn btn--primary" onClick={handleAuthRequired}>Оценить</button>
            <button className="btn btn--outline" onClick={handleAuthRequired}>В подборку</button>
          </div>
        </div>
      </div>

      {work.description && (
        <section className="work-section">
          <h2 className="work-section__title">О произведении</h2>
          <p className="work-section__text">{work.description}</p>
        </section>
      )}

      <section className="work-section">
        <div className="work-section__header">
          <h2 className="work-section__title">
            Рецензии ({work.recentReviews.length})
          </h2>
          <button className="btn btn--outline" onClick={handleAuthRequired}>
            Написать рецензию
          </button>
        </div>

        {work.recentReviews.length === 0 ? (
          <p className="work-section__text">Пока нет рецензий. Будьте первым.</p>
        ) : (
          <div className="reviews-list">
            {work.recentReviews.map((r) => (
              <ReviewItem key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
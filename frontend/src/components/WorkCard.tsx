import { Link } from 'react-router-dom';
import type { Work } from '../api/works';

const typeLabels: Record<string, string> = {
  BOOK: 'Книга',
  MOVIE: 'Фильм',
  GAME: 'Игра',
};

interface Props {
  work: Work;
}

export default function WorkCard({ work }: Props) {
  const shortDescription = work.description
    ? work.description.length > 120
      ? work.description.slice(0, 120) + '…'
      : work.description
    : '';

  return (
    <Link to={`/works/${work.id}`} className="work-card">
      <div className="work-card__cover">
        {work.coverUrl ? (
          <img src={work.coverUrl} alt={work.title} />
        ) : (
          <div className="work-card__placeholder">{work.title[0]}</div>
        )}
      </div>
      <h3 className="work-card__title">{work.title}</h3>
      <p className="work-card__meta">
        {typeLabels[work.type]} · {work.releaseYear ?? '—'}
      </p>
      <div className="work-card__rating">
        <span className="work-card__stars">
          {'★'.repeat(Math.round(work.avgRating / 2))}
          {'☆'.repeat(5 - Math.round(work.avgRating / 2))}
        </span>
        <span className="work-card__score">
          {work.avgRating > 0 ? work.avgRating.toFixed(1) : '—'}
        </span>
      </div>
      {shortDescription && (
        <p className="work-card__desc">{shortDescription}</p>
      )}
    </Link>
  );
}
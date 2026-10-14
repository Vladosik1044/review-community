import { useState } from 'react';
import type { Review } from '../api/work';

interface Props {
  review: Review;
}

export default function ReviewItem({ review }: Props) {
  const [revealed, setRevealed] = useState(false);

  const isHidden = review.hasSpoiler && !revealed;

  return (
    <article className="review-item">
      <div className="review-item__head">
        <span className="review-item__author">{review.author.username}</span>
        <span className="review-item__date">
          {new Date(review.createdAt).toLocaleDateString('ru-RU')}
        </span>
      </div>

      {review.hasSpoiler && (
        <span className="review-item__spoiler">Спойлер</span>
      )}

      {isHidden ? (
        <div className="review-item__hidden">
          <p>Содержание скрыто из-за спойлера</p>
          <button
            className="review-item__reveal"
            onClick={() => setRevealed(true)}
          >
            Показать текст →
          </button>
        </div>
      ) : (
        <p className="review-item__text">{review.text}</p>
      )}

      <span className="review-item__likes">♥ {review.likes}</span>
    </article>
  );
}
import { useEffect, useState } from 'react';
import { fetchWorks } from '../api/works';
import type { Work } from '../api/works';
import WorkCard from '../components/WorkCard';

const typeTabs = [
  { value: '', label: 'Все' },
  { value: 'MOVIE', label: 'Фильмы' },
  { value: 'BOOK', label: 'Книги' },
  { value: 'GAME', label: 'Игры' },
];

const sortOptions = [
  { value: '', label: 'По умолчанию' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'year', label: 'По году' },
  { value: 'title', label: 'По названию' },
];

export default function CatalogPage() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchWorks({
      page,
      limit: 6,
      type: type || undefined,
      search: search || undefined,
      sort: sort || undefined,
    })
      .then((data) => {
        setWorks(data.works);
        setTotalPages(data.totalPages);
      })
      .catch(() => setError('Не удалось загрузить каталог'))
      .finally(() => setLoading(false));
  }, [page, type, search, sort]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function handleTypeChange(newType: string) {
    setType(newType);
    setPage(1);
  }

  function handleSortChange(newSort: string) {
    setSort(newSort);
    setPage(1);
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="page">
      <h1>Каталог</h1>

      <form className="catalog-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Поиск по названию, автору..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit">Найти</button>
      </form>

      <div className="catalog-controls">
        <div className="catalog-tabs">
          {typeTabs.map((tab) => (
            <button
              key={tab.value}
              className={`catalog-tab ${type === tab.value ? 'catalog-tab--active' : ''}`}
              onClick={() => handleTypeChange(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <select
          className="catalog-sort"
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Загрузка...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && works.length === 0 && (
        <p>Ничего не найдено.</p>
      )}

      {!loading && !error && works.length > 0 && (
        <>
          <div className="works-grid">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ←
              </button>

              {pages.map((n) => (
                <button
                  key={n}
                  className={`pagination__btn ${n === page ? 'pagination__btn--active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}

              <button
                className="pagination__btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <nav className="footer__nav">
          <Link to="/">Каталог</Link>
          <Link to="/lists">Списки</Link>
        </nav>
      </div>
    </footer>
  );
}
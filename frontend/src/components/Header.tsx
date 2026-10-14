import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="header">
      <div className="header__inner">
        <Link to="/" className="header__logo">
          <img src="/logo.png" alt="Рецензия" className="header__logo-img" />
        </Link>
        <nav className="header__nav">
          <NavLink to="/" end>Каталог</NavLink>
          <NavLink to="/lists">Списки</NavLink>
        </nav>
        <div className="header__auth">
          <Link to="/login" className="header__btn">Войти</Link>
        </div>
      </div>
    </header>
  );
}
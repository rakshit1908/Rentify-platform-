import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/properties', label: 'Find Homes' },
  { to: '/#how-it-works', label: 'How It Works', hash: true },
  { to: '/about', label: 'About' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const handleHashNavigation = (event, hash) => {
    event.preventDefault();
    setMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/${hash}`);
      return;
    }
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const dashboardPath = user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/renter';

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} role="banner">
      <div className="navbar__inner container">
        {/* ======================================================
            BRAND
            Rentify house-mark + wordmark.
        ====================================================== */}
        <Link to="/" className="navbar__logo" aria-label="Rentify home">
          <span className="navbar__logo-icon" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M4 14.2 16 4l12 10.2v13.2a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 27.4V14.2Z" fill="#3478F6"/>
              <path d="m2.8 14.5 13.2-11 13.2 11" stroke="#2453A6" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M11.5 28V17.5h9V28M14.5 11.5h3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <span>
            <strong className="navbar__logo-text">Rentify</strong>
            <small className="navbar__logo-tagline">Find. Rent. Belong.</small>
          </span>
        </Link>

        {/* ======================================================
            DESKTOP NAVIGATION
        ====================================================== */}
        <nav className="navbar__nav" aria-label="Main navigation">
          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.hash ? (
                  <a href={link.to} className="navbar__link" onClick={(e) => handleHashNavigation(e, '#how-it-works')}>
                    {link.label}
                  </a>
                ) : (
                  <NavLink to={link.to} end={link.end} className={({ isActive }) => `navbar__link ${isActive ? 'navbar__link--active' : ''}`}>
                    {link.label}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* ======================================================
            AUTH / DASHBOARD ACTIONS
        ====================================================== */}
        <div className="navbar__actions">
          <Link to="/properties" className="navbar__search-link" aria-label="Search homes" title="Search homes">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/></svg>
          </Link>
          {isAuthenticated && user ? (
            <>
              <Link to={dashboardPath} className="navbar__btn navbar__btn--ghost">Dashboard</Link>
              <button className="navbar__btn navbar__btn--outline" onClick={handleLogout}>Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="navbar__btn navbar__btn--ghost">Login</Link>
              <Link to="/auth/register" className="navbar__btn navbar__btn--primary">Sign Up</Link>
            </>
          )}
        </div>

        <button className={`navbar__hamburger ${menuOpen ? 'navbar__hamburger--open' : ''}`} onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
          <span className="navbar__hamburger-bar" /><span className="navbar__hamburger-bar" /><span className="navbar__hamburger-bar" />
        </button>
      </div>

      {/* ========================================================
          MOBILE MENU
      ======================================================== */}
      <div id="mobile-menu" className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          <ul className="navbar__mobile-links">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                {link.hash ? (
                  <a href={link.to} className="navbar__mobile-link" onClick={(e) => handleHashNavigation(e, '#how-it-works')}>{link.label}</a>
                ) : (
                  <NavLink to={link.to} end={link.end} className={({ isActive }) => `navbar__mobile-link ${isActive ? 'navbar__mobile-link--active' : ''}`}>{link.label}</NavLink>
                )}
              </li>
            ))}
            {isAuthenticated && <li><NavLink to={dashboardPath} className="navbar__mobile-link">My Dashboard</NavLink></li>}
          </ul>
        </nav>

        <div className="navbar__mobile-actions">
          {isAuthenticated ? (
            <button className="navbar__btn navbar__btn--outline navbar__btn--full" onClick={handleLogout}>Sign out</button>
          ) : (
            <>
              <Link to="/auth/login" className="navbar__btn navbar__btn--outline navbar__btn--full">Login</Link>
              <Link to="/auth/register" className="navbar__btn navbar__btn--primary navbar__btn--full">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

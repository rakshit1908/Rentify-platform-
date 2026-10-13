import { Link } from 'react-router-dom';
import './Footer.css';

const FOOTER_LINKS = {
  Company: [
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact' },
    { to: '/careers', label: 'Careers' },
  ],
  Rentals: [
    { to: '/properties', label: 'Browse Properties' },
    { to: '/auth/register', label: 'List Your Property' },
    { to: '/how-it-works', label: 'How It Works' },
  ],
  Legal: [
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
    { to: '/cookies', label: 'Cookie Policy' },
  ],
};

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner container">
        {/* Brand column */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo" aria-label="Rentify home">
            <span className="footer__logo-icon" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
                <path d="M4 11.5L14 4l10 7.5V24a1 1 0 01-1 1H5a1 1 0 01-1-1V11.5z"
                  fill="var(--color-primary-300)" stroke="var(--color-primary-300)" strokeWidth="1.5" strokeLinejoin="round"/>
                <rect x="10" y="16" width="8" height="9" rx="1"
                  fill="var(--color-secondary-400)" stroke="var(--color-secondary-400)" strokeWidth="1"/>
              </svg>
            </span>
            <span className="footer__logo-text">Rentify</span>
          </Link>
          <p className="footer__tagline">
            Find your perfect home. Premium rentals, zero hassle.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([group, links]) => (
          <div key={group} className="footer__col">
            <h4 className="footer__col-heading">{group}</h4>
            <ul className="footer__col-links">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <div className="footer__bottom-inner container">
          <p className="footer__copy">
            &copy; {year} Rentify. All rights reserved.
          </p>
          <p className="footer__made">
            Built with care for renters &amp; owners.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

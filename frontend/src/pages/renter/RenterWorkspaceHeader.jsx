import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RenterWorkspaceHeader = ({
  eyebrow = 'Renter workspace',
  title,
  highlight,
  subtitle,
  actionTo,
  actionLabel,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const name = user?.full_name || user?.name || 'Renter';
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0].toUpperCase()).join('');

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/properties?search=${encodeURIComponent(query)}` : '/properties');
  };

  return (
    <>
      <div className="renter-workspace-toolbar">
        <Link to="/" className="renter-workspace-toolbar__brand" aria-label="Rentify home">
          <span className="renter-workspace-toolbar__mark" aria-hidden="true">
            <svg viewBox="0 0 28 28" fill="none">
              <path d="M3 12 14 3l11 9v12H3V12Z" fill="currentColor" />
              <path d="M11 24v-8h6v8" stroke="white" strokeWidth="2" />
            </svg>
          </span>
          <span><strong>Rentify</strong><small>Find Your Perfect Home</small></span>
        </Link>
        <form className="renter-workspace-toolbar__search" onSubmit={handleSearch}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
            <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search properties, locations..."
            aria-label="Search rental properties"
          />
          <button type="submit" aria-label="Search properties">Search</button>
        </form>
        <Link to="/renter/inquiries" className="renter-workspace-toolbar__inquiries" aria-label="My inquiries">
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 4h14v10H9l-4 3v-3H3V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="renter-workspace-toolbar__avatar" aria-hidden="true">
          {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials || 'R'}
        </span>
        <span className="renter-workspace-toolbar__user">
          <strong>{name}</strong>
          <small>Renter Account</small>
        </span>
      </div>

      <header className="renter-workspace-hero">
        <div className="renter-workspace-hero__content">
          <span className="renter-workspace-hero__eyebrow">{eyebrow}</span>
          <h1>
            {title}
            {highlight && <><br /><span>{highlight}</span></>}
          </h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actionTo && actionLabel && (
          <Link to={actionTo} className="renter-workspace-hero__action">
            <span aria-hidden="true">⌕</span>{actionLabel}
          </Link>
        )}
      </header>
    </>
  );
};

export default RenterWorkspaceHeader;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth }      from '../../context/AuthContext';
import { useFavorites } from '../../hooks/useFavorites';
import './PropertyCard.css';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const PropertyCard = ({ property, className = '', showRemove = false, onRemove }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { ids: favIds, toggle: toggleFav } = useFavorites();
  const [imgError, setImgError] = useState(false);

  const {
    id, title = 'Untitled Property',
    city = '', state = '', rent = 0,
    property_type = 'apartment',
    bedrooms, bathrooms, area,
    status = 'available',
    property_images = [],
  } = property || {};

  const isDemo = String(id).startsWith('demo-');
  const detailPath = isDemo ? '/properties' : `/properties/${id}`;
  const isFav = !isDemo && favIds.has(id);
  const coverImage = !imgError
    ? (property_images.find((i) => i.is_primary)?.image_url || property_images[0]?.image_url || null)
    : null;
  const location    = [city, state].filter(Boolean).join(', ');
  const isAvailable = status === 'available';

  const handleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (isDemo) { navigate('/properties'); return; }
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    toggleFav(id);
  };

  return (
    <article className={`property-card ${className}`.trim()}>
      {/* Image */}
      <Link to={detailPath} className="property-card__image-link" tabIndex={-1} aria-hidden="true">
        <div className="property-card__image-wrapper">
          {coverImage
            ? <img src={coverImage} alt={title} className="property-card__image" loading="lazy"
                onError={() => setImgError(true)} />
            : <div className="property-card__image-placeholder" aria-hidden="true">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M5 15L20 5l15 10v20H5V15z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <rect x="14" y="24" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </div>
          }
          <div className="property-card__badges">
            <span className={`badge ${isAvailable ? 'badge-success' : 'badge-error'}`}>
              {isAvailable ? 'Available' : 'Rented'}
            </span>
          </div>
          <button
            className={`property-card__fav ${isFav ? 'property-card__fav--active' : ''}`}
            onClick={handleFav}
            aria-label={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 15.5S2 10.8 2 6.5a4 4 0 018-1.1 4 4 0 018 1.1C18 10.8 9 15.5 9 15.5z"
                stroke="currentColor" strokeWidth="1.6"
                fill={isFav ? 'currentColor' : 'none'}
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </Link>

      {/* Body */}
      <div className="property-card__body">
        <span className="property-card__type overline" style={{ textTransform: 'capitalize' }}>{property_type}</span>
        <h3 className="property-card__title">
          <Link to={detailPath} className="property-card__title-link">{title}</Link>
        </h3>
        {location && (
          <p className="property-card__location">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1.5C5.07 1.5 3.5 3.07 3.5 5c0 2.625 3.5 7 3.5 7S10.5 7.625 10.5 5c0-1.93-1.57-3.5-3.5-3.5z"
                stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="7" cy="5" r="1.25" stroke="currentColor" strokeWidth="1.2"/>
            </svg>
            {location}
          </p>
        )}
        <ul className="property-card__stats" aria-label="Property details">
          {bedrooms  != null && <li className="property-card__stat"><span>{bedrooms} {bedrooms===1?'Bed':'Beds'}</span></li>}
          {bathrooms != null && <li className="property-card__stat"><span>{bathrooms} {bathrooms===1?'Bath':'Baths'}</span></li>}
          {area      != null && <li className="property-card__stat"><span>{area} sq ft</span></li>}
        </ul>
      </div>

      {/* Footer */}
      <div className="property-card__footer">
        <div className="property-card__price">
          <span className="property-card__price-value">{fmt(rent)}</span>
          <span className="property-card__price-unit">/mo</span>
        </div>
        {showRemove && onRemove
          ? <button className="btn btn--danger btn--sm" onClick={() => onRemove(id)}>Remove</button>
          : <Link to={detailPath} className="property-card__cta">
              View Details
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
        }
      </div>
    </article>
  );
};

export default PropertyCard;

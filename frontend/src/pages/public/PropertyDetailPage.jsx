import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchPropertyById } from '../../services/property.service';
import { useAuth }        from '../../context/AuthContext';
import { useFavorites }   from '../../hooks/useFavorites';
import ImageGallery       from '../../components/property/ImageGallery';
import PropertyMap        from '../../components/property/PropertyMap';
import ContactModal       from '../../components/common/ContactModal';
import Loader             from '../../components/common/Loader';
import ErrorState         from '../../components/common/ErrorState';
import './PropertyDetailPage.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency', currency: 'INR', maximumFractionDigits: 0,
      }).format(n)
    : null;

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [property, setProperty]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [contactOpen, setContactOpen] = useState(false);
  const { ids: favIds, toggle: toggleFav } = useFavorites();

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchPropertyById(id)
      .then((res) => {
        if (!res.data?.property) { setError('Property not found.'); return; }
        setProperty(res.data.property);
      })
      .catch((err) => setError(err.message || 'Failed to load property.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullPage label="Loading property…" />;

  if (error) return (
    <div className="container section">
      <ErrorState
        type="page"
        title={error === 'Property not found.' ? 'Property not found' : 'Could not load property'}
        description={
          error === 'Property not found.'
            ? 'This listing may have been removed or made unavailable.'
            : error
        }
        onRetry={error !== 'Property not found.' ? () => window.location.reload() : undefined}
      />
    </div>
  );

  const { images = [], amenities = [], profiles: owner } = property;

  return (
    <div className="property-detail">
      <div className="container">

        {/* ── Breadcrumb ──────────────────────────────── */}
        <nav className="pd-breadcrumb" aria-label="Breadcrumb">
          <Link to="/properties" className="pd-breadcrumb__link">Browse</Link>
          <span aria-hidden="true"> / </span>
          <span className="pd-breadcrumb__current" title={property.title}>
            {property.title.length > 40 ? property.title.slice(0, 40) + '…' : property.title}
          </span>
        </nav>

        <div className="pd-layout">

          {/* ── Left column ───────────────────────────── */}
          <div className="pd-main">

            {/* Gallery */}
            <ImageGallery images={images} title={property.title} />

            {/* Quick stats strip */}
            <div className="pd-strip">
              {property.bedrooms  != null && (
                <div className="pd-strip__item">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="1" y="8" width="16" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M1 12V5a2.5 2.5 0 012.5-2.5h11A2.5 2.5 0 0117 5v7M1 12h16" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <strong>{property.bedrooms}</strong>
                  <span>Bed{property.bedrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.bathrooms != null && (
                <div className="pd-strip__item">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3 9h12v4a4 4 0 01-4 4H7a4 4 0 01-4-4V9z" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M3 9V4a2 2 0 014 0v5" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <strong>{property.bathrooms}</strong>
                  <span>Bath{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              )}
              {property.area != null && (
                <div className="pd-strip__item">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <rect x="2" y="2" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                    <path d="M5 5h3M5 5v3M13 13h-3M13 13v-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  </svg>
                  <strong>{property.area}</strong>
                  <span>sq ft</span>
                </div>
              )}
              {property.property_type && (
                <div className="pd-strip__item">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M3 7.5L9 2l6 5.5V16a1 1 0 01-1 1H4a1 1 0 01-1-1V7.5z" stroke="currentColor" strokeWidth="1.3"/>
                    <rect x="6" y="10" width="6" height="7" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
                  </svg>
                  <strong style={{ textTransform: 'capitalize' }}>{property.property_type}</strong>
                </div>
              )}
            </div>

            {/* Description */}
            {property.description && (
              <section className="pd-section">
                <h2 className="pd-section__title">About this property</h2>
                <p className="pd-description">{property.description}</p>
              </section>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <section className="pd-section">
                <h2 className="pd-section__title">Amenities</h2>
                <ul className="pd-amenities">
                  {amenities.map((a) => (
                    <li key={a.id} className="pd-amenity">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2 7l4 4 6-7" stroke="currentColor" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {a.name}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Map */}
            <section className="pd-section">
              <h2 className="pd-section__title">Location</h2>
              <p className="pd-map-address">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5C5.07 1.5 3.5 3.07 3.5 5c0 2.625 3.5 7 3.5 7S10.5 7.625 10.5 5c0-1.93-1.57-3.5-3.5-3.5z"
                    stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="7" cy="5" r="1.25" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                {[property.address, property.city, property.state, property.pincode]
                  .filter(Boolean).join(', ')}
              </p>
              <div className="pd-map-wrap">
                <PropertyMap
                  latitude={property.latitude}
                  longitude={property.longitude}
                  title={property.title}
                />
              </div>
            </section>
          </div>

          {/* ── Sidebar ────────────────────────────────── */}
          <aside className="pd-sidebar">
            <div className="pd-sidebar__card">

              {/* Status + type */}
              <div className="pd-sidebar__meta">
                <span className="overline text-secondary" style={{ textTransform: 'capitalize' }}>
                  {property.property_type}
                </span>
                <span className={`badge ${property.status === 'available' ? 'badge-success' : 'badge-error'}`}>
                  {property.status}
                </span>
              </div>

              {/* Title */}
              <h1 className="pd-sidebar__title">{property.title}</h1>

              {/* Location */}
              <p className="pd-sidebar__location">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1.5C5.07 1.5 3.5 3.07 3.5 5c0 2.625 3.5 7 3.5 7S10.5 7.625 10.5 5c0-1.93-1.57-3.5-3.5-3.5z"
                    stroke="currentColor" strokeWidth="1.2"/>
                  <circle cx="7" cy="5" r="1.25" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                {[property.city, property.state].filter(Boolean).join(', ')}
              </p>

              <div className="pd-divider" />

              {/* Pricing */}
              <div className="pd-pricing">
                <div className="pd-pricing__rent">
                  <span className="pd-pricing__value">{fmt(property.rent)}</span>
                  <span className="pd-pricing__unit">/month</span>
                </div>
                {property.security_deposit > 0 && (
                  <p className="pd-pricing__deposit">
                    + {fmt(property.security_deposit)} security deposit
                  </p>
                )}
              </div>

              <div className="pd-divider" />

              {/* Owner info — only name + avatar, no phone/email */}
              {owner && (
                <div className="pd-owner">
                  <div className="pd-owner__avatar" aria-hidden="true">
                    {owner.avatar_url
                      ? <img src={owner.avatar_url} alt="" />
                      : <span>{owner.full_name?.[0] || 'O'}</span>
                    }
                  </div>
                  <div>
                    <p className="pd-owner__name">{owner.full_name}</p>
                    <p className="pd-owner__role overline">Property Owner</p>
                  </div>
                </div>
              )}

              <div className="pd-actions">
                <button
                  className={`pd-fav-btn ${favIds.has(property.id) ? 'pd-fav-btn--active' : ''}`}
                  onClick={() => {
                    if (!isAuthenticated) { navigate('/auth/login'); return; }
                    toggleFav(property.id);
                  }}
                  aria-label={favIds.has(property.id) ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                    <path d="M9 15.5S2 10.8 2 6.5a4 4 0 018-1.1 4 4 0 018 1.1C18 10.8 9 15.5 9 15.5z"
                      stroke="currentColor" strokeWidth="1.5"
                      fill={favIds.has(property.id) ? 'var(--color-error)' : 'none'}
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {favIds.has(property.id) ? 'Saved' : 'Save'}
                </button>

                <button
                  className="btn btn--primary btn--lg pd-contact-btn"
                  disabled={property.status !== 'available'}
                  onClick={() => {
                    if (!isAuthenticated) { navigate('/auth/login'); return; }
                    setContactOpen(true);
                  }}
                >
                  {property.status === 'available' ? 'Contact Owner' : 'Not Available'}
                </button>
              </div>

              {!isAuthenticated && (
                <p className="pd-login-hint">
                  <Link to="/auth/login" className="pd-login-hint__link">Sign in</Link> to contact the owner or save this property.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        property={property}
      />
    </div>
  );
};

export default PropertyDetailPage;

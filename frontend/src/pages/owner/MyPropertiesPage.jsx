import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchMyProperties,
  deleteProperty,
  updatePropertyStatus,
} from '../../services/property.service';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Loader     from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Modal      from '../../components/common/Modal';
import Button     from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import './MyPropertiesPage.css';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const StatusBadge = ({ status }) => (
  <span className={`mp-status mp-status--${status === 'available' ? 'available' : status === 'rented' ? 'rented' : 'inactive'}`}>
    {status || 'inactive'}
  </span>
);

const NAV_ITEMS = [
  { to: '/dashboard/owner', label: 'Dashboard', exact: true },
  { to: '/owner/properties', label: 'My Properties', exact: true },
  { to: '/owner/properties/new', label: 'Add Property', exact: true },
  { to: '/owner/inquiries', label: 'Inquiries' },
];

const PROPERTY_FILTERS = [
  { id: 'all', label: 'All Properties' },
  { id: 'available', label: 'Available' },
  { id: 'rented', label: 'Rented' },
  { id: 'draft', label: 'Drafts' },
  { id: 'inactive', label: 'Inactive' },
];

const MyPropertiesPage = () => {
  const { user } = useAuth();

  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setActionLoading] = useState(null); // property id being acted on
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    fetchMyProperties()
      .then((res) => setProperties(res.data?.properties || []))
      .catch((err) => setError(err.message || 'Failed to load properties.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  /* ── Status toggle ───────────────────────────────────── */
  const handleStatusToggle = async (property) => {
    const next = property.status === 'available' ? 'rented' : 'available';
    setActionLoading(property.id);
    try {
      await updatePropertyStatus(property.id, next);
      setProperties((p) =>
        p.map((x) => x.id === property.id ? { ...x, status: next } : x)
      );
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Delete ──────────────────────────────────────────── */
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProperty(deleteTarget.id);
      setProperties((p) => p.filter((x) => x.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const coverImage = (p) =>
    p.property_images?.find((i) => i.is_primary)?.image_url ||
    p.property_images?.[0]?.image_url ||
    null;

  const counts = useMemo(() => properties.reduce((result, property) => {
    const status = String(property.status || '').toLowerCase();
    result.all += 1;
    if (status === 'available') result.available += 1;
    else if (status === 'rented') result.rented += 1;
    else if (status === 'draft') result.draft += 1;
    else result.inactive += 1;
    return result;
  }, { all: 0, available: 0, rented: 0, draft: 0, inactive: 0 }), [properties]);

  const visibleProperties = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = properties.filter((property) => {
      const status = String(property.status || '').toLowerCase();
      const matchesStatus = activeFilter === 'all'
        || (activeFilter === 'inactive'
          ? !['available', 'rented', 'draft'].includes(status)
          : status === activeFilter);
      const searchable = [
        property.title,
        property.property_type,
        property.city,
        property.state,
        property.address,
      ].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });

    if (sortBy === 'rent-low') return filtered.sort((a, b) => Number(a.rent || 0) - Number(b.rent || 0));
    if (sortBy === 'rent-high') return filtered.sort((a, b) => Number(b.rent || 0) - Number(a.rent || 0));
    if (sortBy === 'oldest') return filtered.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    return filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [properties, activeFilter, search, sortBy]);

  const initials = (user?.full_name || user?.name || 'Owner')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="owner">
      <div className="my-properties">
        <div className="mp-toolbar">
          <Link to="/" className="mp-toolbar__brand" aria-label="Rentify home">
            <span className="mp-toolbar__mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <path d="M3 12 14 3l11 9v12H3V12Z" fill="currentColor" />
                <path d="M11 24v-8h6v8" stroke="white" strokeWidth="2" />
              </svg>
            </span>
            <span><strong>Rentify</strong><small>Find Your Perfect Home</small></span>
          </Link>
          <label className="mp-toolbar__search">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
              <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your properties..."
              aria-label="Search your properties"
            />
          </label>
          <Link className="mp-toolbar__inquiries" to="/owner/inquiries" aria-label="View inquiries">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 4h14v10H9l-4 3v-3H3V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </Link>
          <span className="mp-toolbar__avatar" aria-hidden="true">
            {user?.avatar_url ? <img src={user.avatar_url} alt="" /> : initials || 'O'}
          </span>
          <span className="mp-toolbar__user">
            <strong>{user?.full_name || user?.name || 'Property Owner'}</strong>
            <small>Owner Account</small>
          </span>
        </div>

        <header className="my-properties__header">
          <div className="my-properties__heading">
            <span className="my-properties__eyebrow">Owner workspace</span>
            <h1 className="my-properties__title">My <span>Properties</span></h1>
            <p className="my-properties__sub">
              Manage your listings, track inquiries and grow your rental business all in one place.
            </p>
          </div>
          <Link to="/owner/properties/new" className="my-properties__add">
            <span aria-hidden="true">+</span> Add Property
          </Link>
        </header>

        <section className="mp-workspace" aria-label="Your property listings">
          <div className="mp-controls">
            <div className="mp-tabs" role="tablist" aria-label="Filter properties by status">
              {PROPERTY_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={activeFilter === filter.id}
                  className={`mp-tab${activeFilter === filter.id ? ' mp-tab--active' : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span className={`mp-tab__dot mp-tab__dot--${filter.id}`} aria-hidden="true" />
                  {filter.label}
                  <span className="mp-tab__count">{counts[filter.id]}</span>
                </button>
              ))}
            </div>
            <label className="mp-sort">
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} aria-label="Sort properties">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="rent-low">Rent: low to high</option>
                <option value="rent-high">Rent: high to low</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="mp-loading"><Loader size="md" label="Loading your properties..." /></div>
          ) : error ? (
            <div className="mp-error"><ErrorState type="inline" title="Your properties could not be loaded" description={error} onRetry={load} /></div>
          ) : visibleProperties.length === 0 ? (
            properties.length === 0 && activeFilter === 'all' && !search ? (
              <div className="mp-empty">
                <div className="mp-empty__art" aria-hidden="true">
                  <svg viewBox="0 0 300 180" fill="none">
                    <path d="M35 153h230" stroke="#C7E2FC" strokeWidth="5" strokeLinecap="round" />
                    <path d="M83 80 150 28l67 52v72H83V80Z" fill="#EAF5FF" stroke="#83B9F4" strokeWidth="4" strokeLinejoin="round" />
                    <path d="m67 84 83-64 83 64" stroke="#1675F4" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M131 151v-46a19 19 0 0138 0v46" fill="#B8DCFF" stroke="#4E9AF0" strokeWidth="4" />
                    <path d="M101 91h24v23h-24zM175 91h24v23h-24z" fill="#BDE5FF" stroke="#4E9AF0" strokeWidth="4" />
                    <path d="M52 150c0-13 10-23 23-23s23 10 23 23M202 150c0-13 10-23 23-23s23 10 23 23" stroke="#58BD8B" strokeWidth="8" strokeLinecap="round" />
                    <path d="M208 118h47v32h-47z" fill="#1375F5" />
                    <text x="231.5" y="131" fill="white" textAnchor="middle" fontSize="9" fontWeight="800">FOR</text>
                    <text x="231.5" y="142" fill="white" textAnchor="middle" fontSize="9" fontWeight="800">RENT</text>
                    <circle cx="58" cy="55" r="15" fill="#F8FBFF" />
                    <path d="M50 57c3-6 13-6 16 0M54 50a4 4 0 108 0 4 4 0 00-8 0" stroke="#9DC9F7" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <h2>No properties yet</h2>
                <p>Start by adding your first property and reach renters looking for a place to call home.</p>
                <Link to="/owner/properties/new" className="mp-empty__button">
                  <span aria-hidden="true">+</span> Add Your First Property
                </Link>
                <div className="mp-benefits">
                  <article><span className="mp-benefits__icon mp-benefits__icon--pink">⌂</span><strong>List your property</strong><small>Add details, photos and amenities.</small></article>
                  <article><span className="mp-benefits__icon mp-benefits__icon--blue">♧</span><strong>Reach more tenants</strong><small>Connect with genuine renters.</small></article>
                  <article><span className="mp-benefits__icon mp-benefits__icon--green">↗</span><strong>Track performance</strong><small>Manage your rental activity.</small></article>
                  <article><span className="mp-benefits__icon mp-benefits__icon--purple">⚙</span><strong>Manage easily</strong><small>Edit or update listings anytime.</small></article>
                </div>
              </div>
            ) : (
              <div className="mp-empty mp-empty--filtered">
                <EmptyState
                  title="No matching properties"
                  description="Try another search or status filter, or add a new property."
                  action={{
                    label: 'Clear filters',
                    onClick: () => { setSearch(''); setActiveFilter('all'); },
                    variant: 'outline',
                  }}
                />
              </div>
            )
          ) : (
            <div className="mp-grid">
              {visibleProperties.map((prop) => (
              <div key={prop.id} className="mp-card">
                {/* Image */}
                <div className="mp-card__image">
                  {coverImage(prop) ? (
                    <img src={coverImage(prop)} alt={prop.title} loading="lazy" />
                  ) : (
                    <div className="mp-card__image-placeholder" aria-hidden="true">
                      <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                        <path d="M5 15L20 5l15 10v20H5V15z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                        <rect x="14" y="24" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  )}
                  <div className="mp-card__image-badge">
                    <StatusBadge status={prop.status} />
                  </div>
                </div>

                {/* Body */}
                <div className="mp-card__body">
                  <div className="mp-card__meta">
                    <span className="overline text-secondary" style={{ textTransform: 'capitalize' }}>
                      {prop.property_type}
                    </span>
                    <span className="text-xs text-muted">
                      {[prop.city, prop.state].filter(Boolean).join(', ')}
                    </span>
                  </div>

                  <h3 className="mp-card__title">
                    <Link to={`/properties/${prop.id}`}>{prop.title}</Link>
                  </h3>

                  <div className="mp-card__stats">
                    {prop.bedrooms  != null && <span>{prop.bedrooms} bed</span>}
                    {prop.bathrooms != null && <span>{prop.bathrooms} bath</span>}
                    {prop.area      != null && <span>{prop.area} sq ft</span>}
                  </div>

                  <p className="mp-card__rent">{fmt(prop.rent)}<span>/month</span></p>
                </div>

                {/* Actions */}
                <div className="mp-card__actions">
                  <Link
                    to={`/owner/properties/${prop.id}/edit`}
                    className="btn btn--outline btn--sm"
                  >
                    Edit
                  </Link>

                  <Link
                    to={`/owner/properties/${prop.id}/images`}
                    className="btn btn--ghost btn--sm"
                  >
                    Images
                  </Link>

                  <Button
                    variant="ghost"
                    size="sm"
                    loading={actionLoading === prop.id}
                    onClick={() => handleStatusToggle(prop)}
                  >
                    Mark {prop.status === 'available' ? 'Rented' : 'Available'}
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteTarget(prop)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              ))}
            </div>
          )}
        </section>

      {/* ── Delete confirmation modal ─────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete property"
        size="sm"
      >
        <div className="mp-delete-modal">
          <p className="mp-delete-modal__text">
            Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?
            This will also delete all images and cannot be undone.
          </p>
          <div className="mp-delete-modal__actions">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
      </div>
    </DashboardLayout>
  );
};

export default MyPropertiesPage;

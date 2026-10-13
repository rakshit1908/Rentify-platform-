import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchMyProperties,
  deleteProperty,
  updatePropertyStatus,
} from '../../services/property.service';
import Loader     from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import Modal      from '../../components/common/Modal';
import Button     from '../../components/common/Button';
import './MyPropertiesPage.css';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const StatusBadge = ({ status }) => (
  <span className={`badge ${status === 'available' ? 'badge-success' : 'badge-error'}`}>
    {status}
  </span>
);

const MyPropertiesPage = () => {
  const navigate = useNavigate();

  const [properties, setProperties]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setActionLoading] = useState(null); // property id being acted on

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

  if (loading) return <Loader fullPage label="Loading your properties..." />;

  return (
    <div className="my-properties">
      {/* ── Header ──────────────────────────────────── */}
      <div className="my-properties__header">
        <div className="container">
          <div className="my-properties__header-inner">
            <div>
              <h1 className="my-properties__title">My Properties</h1>
              <p className="my-properties__sub">{properties.length} listing{properties.length !== 1 ? 's' : ''}</p>
            </div>
            <Link to="/owner/properties/new" className="btn btn--primary btn--md">
              + Add property
            </Link>
          </div>
        </div>
      </div>

      <div className="container my-properties__body">
        {error && (
          <ErrorState type="inline" title={error} onRetry={load} />
        )}

        {!error && properties.length === 0 && (
          <EmptyState
            title="No properties yet"
            description="Add your first listing to start receiving enquiries."
            action={{ label: '+ Add property', onClick: () => navigate('/owner/properties/new') }}
          />
        )}

        {properties.length > 0 && (
          <div className="mp-grid">
            {properties.map((prop) => (
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
      </div>

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
  );
};

export default MyPropertiesPage;

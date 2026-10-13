import { useState } from 'react';
import { Link }  from 'react-router-dom';
import Button    from '../common/Button';
import { updateInquiryStatus } from '../../services/inquiries.service';
import './InquiryCard.css';

const STATUS_STYLES = {
  pending:   'badge-warning',
  contacted: 'badge-info',
  closed:    'badge-secondary',
};

const STATUS_NEXT = {
  pending:   [{ value: 'contacted', label: 'Mark Contacted' }],
  contacted: [{ value: 'closed',    label: 'Mark Closed'    }],
  closed:    [],
};

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/**
 * InquiryCard
 * inquiry — inquiry object from backend
 * viewAs  — 'owner' | 'renter'
 * onStatusChange(id, newStatus) — callback
 */
const InquiryCard = ({ inquiry, viewAs = 'renter', onStatusChange }) => {
  const [updating, setUpdating] = useState(false);

  const property = inquiry.properties || inquiry.property;
  const other    = viewAs === 'owner' ? inquiry.renter : inquiry.owner;

  const handleStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await updateInquiryStatus(inquiry.id, newStatus);
      onStatusChange?.(inquiry.id, newStatus);
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  const coverImg = property?.property_images?.find((i) => i.is_primary)?.image_url
    || property?.property_images?.[0]?.image_url;

  return (
    <div className="inquiry-card">
      {/* Property thumbnail */}
      {property && (
        <div className="inquiry-card__property">
          <div className="inquiry-card__thumb">
            {coverImg
              ? <img src={coverImg} alt={property.title} loading="lazy" />
              : <div className="inquiry-card__thumb-placeholder" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M3 8L10 2l7 6v10H3V8z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  </svg>
                </div>
            }
          </div>
          <div className="inquiry-card__prop-info">
            <Link to={`/properties/${property.id}`} className="inquiry-card__prop-title">
              {property.title}
            </Link>
            <span className="inquiry-card__prop-loc">
              {[property.city, property.state].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Message */}
      <div className="inquiry-card__body">
        <p className="inquiry-card__message">"{inquiry.message}"</p>

        <div className="inquiry-card__meta">
          {other && (
            <span className="inquiry-card__person">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <circle cx="7" cy="5" r="3" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M1 13c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              {other.full_name}
            </span>
          )}
          {inquiry.phone && (
            <span className="inquiry-card__phone">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 2h3l1.5 3.5-1.75 1.25A10 10 0 008.25 10.25L9.5 8.5 13 10v3c-6.075 0-11-4.925-11-11z"
                  stroke="currentColor" strokeWidth="1.2"/>
              </svg>
              {inquiry.phone}
            </span>
          )}
          <span className="inquiry-card__date">{fmt(inquiry.created_at)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="inquiry-card__footer">
        <span className={`badge ${STATUS_STYLES[inquiry.status] || 'badge-secondary'}`} style={{ textTransform: 'capitalize' }}>
          {inquiry.status}
        </span>

        {viewAs === 'owner' && STATUS_NEXT[inquiry.status]?.map((action) => (
          <Button key={action.value} variant="outline" size="sm"
            loading={updating} onClick={() => handleStatus(action.value)}>
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default InquiryCard;

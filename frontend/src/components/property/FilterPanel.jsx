import { useState, useEffect } from 'react';
import { fetchAmenities } from '../../services/property.service';
import './FilterPanel.css';

const PROPERTY_TYPES = [
  { value: '', label: 'All types' },
  { value: 'apartment',  label: 'Apartment' },
  { value: 'house',      label: 'House' },
  { value: 'villa',      label: 'Villa' },
  { value: 'studio',     label: 'Studio' },
  { value: 'pg',         label: 'PG / Hostel' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'plot',       label: 'Plot / Land' },
];

const BED_BATH_OPTS = [
  { value: '', label: 'Any' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4+' },
];

/**
 * FilterPanel
 *
 * Props:
 *   filters        — current filter state object
 *   onChange(key, value) — update a single filter key
 *   onApply()      — apply / close drawer on mobile
 *   onReset()      — clear all filters
 *   isOpen         — mobile drawer open state
 *   onClose()      — close mobile drawer
 *   activeCount    — number of active filters (for badge)
 */
const FilterPanel = ({
  filters,
  onChange,
  onApply,
  onReset,
  isOpen,
  onClose,
  activeCount = 0,
}) => {
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    fetchAmenities()
      .then((res) => setAmenities(res.data?.amenities || []))
      .catch(() => {});
  }, []);

  const toggleAmenity = (id) => {
    const current = filters.amenities || [];
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    onChange('amenities', next);
  };

  const panel = (
    <div className="filter-panel">
      <div className="filter-panel__header">
        <h2 className="filter-panel__title">Filters</h2>
        {activeCount > 0 && (
          <button className="filter-panel__reset" onClick={onReset}>
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <div className="filter-panel__body">

        {/* Rent range */}
        <div className="fp-group">
          <label className="fp-label">Rent range (₹/month)</label>
          <div className="fp-row">
            <input
              type="number"
              className="fp-input"
              placeholder="Min"
              value={filters.minRent || ''}
              onChange={(e) => onChange('minRent', e.target.value)}
              min={0}
            />
            <span className="fp-sep">–</span>
            <input
              type="number"
              className="fp-input"
              placeholder="Max"
              value={filters.maxRent || ''}
              onChange={(e) => onChange('maxRent', e.target.value)}
              min={0}
            />
          </div>
        </div>

        {/* Property type */}
        <div className="fp-group">
          <label className="fp-label">Property type</label>
          <div className="fp-type-grid">
            {PROPERTY_TYPES.filter((t) => t.value).map((t) => (
              <button
                key={t.value}
                className={`fp-type-btn ${filters.propertyType === t.value ? 'fp-type-btn--active' : ''}`}
                onClick={() => onChange('propertyType', filters.propertyType === t.value ? '' : t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bedrooms */}
        <div className="fp-group">
          <label className="fp-label">Bedrooms</label>
          <div className="fp-pill-row">
            {BED_BATH_OPTS.map((o) => (
              <button
                key={o.value}
                className={`fp-pill ${filters.bedrooms === o.value ? 'fp-pill--active' : ''}`}
                onClick={() => onChange('bedrooms', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bathrooms */}
        <div className="fp-group">
          <label className="fp-label">Bathrooms</label>
          <div className="fp-pill-row">
            {BED_BATH_OPTS.map((o) => (
              <button
                key={o.value}
                className={`fp-pill ${filters.bathrooms === o.value ? 'fp-pill--active' : ''}`}
                onClick={() => onChange('bathrooms', o.value)}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="fp-group">
            <label className="fp-label">Amenities</label>
            <div className="fp-amenities">
              {amenities.map((a) => {
                const checked = (filters.amenities || []).includes(a.id);
                return (
                  <label key={a.id} className={`fp-amenity ${checked ? 'fp-amenity--checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleAmenity(a.id)}
                      className="fp-amenity__cb"
                    />
                    {a.name}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Mobile apply button */}
      <div className="filter-panel__footer">
        <button className="btn btn--primary btn--md w-full" onClick={onApply}>
          Show results
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="filter-sidebar">{panel}</div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div className="filter-drawer-overlay" onClick={onClose} aria-hidden="true" />
      )}
      <div className={`filter-drawer ${isOpen ? 'filter-drawer--open' : ''}`} aria-label="Filters">
        <div className="filter-drawer__close-row">
          <button className="filter-drawer__close" onClick={onClose} aria-label="Close filters">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {panel}
      </div>
    </>
  );
};

export default FilterPanel;

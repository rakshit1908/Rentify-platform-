import { useState, useRef, useEffect } from 'react';
import './SortDropdown.css';

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Newest first' },
  { value: 'rent_asc',  label: 'Rent: Low → High' },
  { value: 'rent_desc', label: 'Rent: High → Low' },
];

const SortDropdown = ({ value = 'newest', onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button
        className="sort-dropdown__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Sort by: ${selected.label}`}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2 4h10M4 7h6M6 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <span>{selected.label}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          className={`sort-dropdown__chevron ${open ? 'sort-dropdown__chevron--open' : ''}`}
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <ul className="sort-dropdown__menu" role="listbox" aria-label="Sort options">
          {SORT_OPTIONS.map((opt) => (
            <li key={opt.value} role="option" aria-selected={opt.value === value}>
              <button
                className={`sort-dropdown__option ${opt.value === value ? 'sort-dropdown__option--active' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
              >
                {opt.label}
                {opt.value === value && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SortDropdown;

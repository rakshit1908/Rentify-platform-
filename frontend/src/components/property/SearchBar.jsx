import { useState } from 'react';
import './SearchBar.css';

/**
 * SearchBar
 * onSearch(value) — called on submit or clear
 * initialValue   — pre-fill from URL param
 */
const SearchBar = ({ onSearch, initialValue = '', placeholder = 'Search by city, title or location…' }) => {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <div className="search-bar__inner">
        <span className="search-bar__icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M11.5 11.5l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </span>

        <input
          type="search"
          className="search-bar__input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label="Search properties"
          autoComplete="off"
        />

        {value && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        <button type="submit" className="search-bar__btn">
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

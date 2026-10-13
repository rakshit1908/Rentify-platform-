import { useState } from 'react';
import useProperties    from '../../hooks/useProperties';
import SearchBar        from '../../components/property/SearchBar';
import FilterPanel      from '../../components/property/FilterPanel';
import SortDropdown     from '../../components/property/SortDropdown';
import PropertyGrid     from '../../components/property/PropertyGrid';
import Pagination       from '../../components/common/Pagination';
import ErrorState       from '../../components/common/ErrorState';
import './PropertiesPage.css';

const PropertiesPage = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    filters, setFilter, commitFilters, resetFilters,
    setSearch, setSort, setPage,
    properties, pagination, loading, error,
    activeFilterCount,
  } = useProperties();

  const handleFilterChange = (key, value) => setFilter(key, value);

  const handleApplyFilters = () => {
    setDrawerOpen(false);
    commitFilters();
  };

  return (
    <div className="properties-page">

      {/* ── Page header ───────────────────────────── */}
      <div className="properties-page__header">
        <div className="container">
          <h1 className="properties-page__title">Browse Properties</h1>
          <p className="properties-page__sub">
            {loading
              ? 'Searching…'
              : `${pagination.total.toLocaleString()} available rental${pagination.total !== 1 ? 's' : ''}`}
          </p>

          {/* Search bar */}
          <div className="properties-page__search">
            <SearchBar
              initialValue={filters.search}
              onSearch={setSearch}
              placeholder="Search by city, title or location…"
            />
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────── */}
      <div className="container properties-page__body">

        {/* Mobile toolbar */}
        <div className="properties-page__toolbar">
          <button
            className={`pp-filter-btn ${activeFilterCount > 0 ? 'pp-filter-btn--active' : ''}`}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open filters"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="pp-filter-btn__badge">{activeFilterCount}</span>
            )}
          </button>

          <div className="properties-page__sort">
            <SortDropdown value={filters.sort} onChange={setSort} />
          </div>
        </div>

        <div className="properties-page__layout">

          {/* Sidebar filters — desktop */}
          <aside className="properties-page__sidebar" aria-label="Filters">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onApply={handleApplyFilters}
              onReset={resetFilters}
              isOpen={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              activeCount={activeFilterCount}
            />
          </aside>

          {/* Main content */}
          <main className="properties-page__main" id="main-content">

            {/* Desktop sort + count row */}
            <div className="pp-results-row">
              <p className="pp-results-count">
                {loading ? '…' : `${pagination.total.toLocaleString()} result${pagination.total !== 1 ? 's' : ''}`}
              </p>
              <SortDropdown value={filters.sort} onChange={setSort} />
            </div>

            {error ? (
              <ErrorState
                type="page"
                title="Failed to load properties"
                description={error}
                onRetry={() => window.location.reload()}
              />
            ) : (
              <>
                <PropertyGrid
                  properties={properties}
                  loading={loading}
                  onResetFilters={activeFilterCount > 0 ? resetFilters : undefined}
                />

                {!loading && pagination.pages > 1 && (
                  <div className="pp-pagination">
                    <Pagination
                      page={pagination.page}
                      totalPages={pagination.pages}
                      onPageChange={setPage}
                    />
                    <p className="pp-pagination__info">
                      Page {pagination.page} of {pagination.pages}
                    </p>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer is rendered inside FilterPanel */}
      <FilterPanel
        filters={filters}
        onChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={resetFilters}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeCount={activeFilterCount}
      />
    </div>
  );
};

export default PropertiesPage;

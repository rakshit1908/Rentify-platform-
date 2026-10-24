import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PropertyCard    from '../../components/property/PropertyCard';
import Loader          from '../../components/common/Loader';
import EmptyState      from '../../components/common/EmptyState';
import ErrorState      from '../../components/common/ErrorState';
import { fetchFavorites } from '../../services/favorites.service';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../../hooks/useFavorites';
import RenterWorkspaceHeader from './RenterWorkspaceHeader';
import './RenterPages.css';

const NAV_ITEMS = [
  { to: '/dashboard/renter', label: 'Dashboard',       exact: true },
  { to: '/properties',       label: 'Explore Homes',   exact: true },
  { to: '/renter/favorites', label: 'Saved Properties' },
  { to: '/renter/inquiries', label: 'My Inquiries' },
  { to: '/renter/profile',   label: 'My Profile' },
];

const RenterFavoritesPage = () => {
  const navigate = useNavigate();
  const { remove } = useFavorites();
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const load = () => {
    setLoading(true);
    setError('');
    fetchFavorites()
      .then((res) => setFavorites(res.data?.favorites || []))
      .catch((err) => setError(err.message || 'Failed to load saved properties.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = async (propertyId) => {
    try {
      await remove(propertyId);
      setFavorites((prev) => prev.filter((f) => f.id !== propertyId));
    } catch (error) {
      alert(error.message || 'Could not remove this property from your saved list. Please try again.');
    }
  };

  const visibleFavorites = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = favorites.filter((property) => [
      property.title,
      property.city,
      property.state,
      property.property_type,
    ].filter(Boolean).join(' ').toLowerCase().includes(query));

    if (sort === 'rent-low') return filtered.sort((a, b) => Number(a.rent || 0) - Number(b.rent || 0));
    if (sort === 'rent-high') return filtered.sort((a, b) => Number(b.rent || 0) - Number(a.rent || 0));
    return filtered;
  }, [favorites, search, sort]);

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="renter">
      <div className="renter-page">
        <RenterWorkspaceHeader
          eyebrow="Your shortlist"
          title="Saved"
          highlight="Properties"
          subtitle="Keep your favorite homes close and compare the places that feel right for you."
          actionTo="/properties"
          actionLabel="Find more homes"
        />

        {loading ? (
          <div className="renter-page__loader"><Loader size="md" /></div>
        ) : error ? (
          <ErrorState type="inline" title={error} onRetry={load} />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No saved properties"
            description="Browse listings and tap the heart icon to save properties you like."
            action={{ label: 'Browse Properties', onClick: () => navigate('/properties') }}
          />
        ) : (
          <>
            <div className="renter-page__toolbar">
              <div>
                <h2>Your saved homes</h2>
                <p>{visibleFavorites.length} of {favorites.length} saved listing{favorites.length !== 1 ? 's' : ''}</p>
              </div>
              <label className="renter-page__search">
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
                  <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search saved homes..." aria-label="Search saved homes" />
              </label>
              <label className="renter-page__sort">
                <span>Sort</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort saved properties">
                  <option value="newest">Default</option>
                  <option value="rent-low">Rent: low to high</option>
                  <option value="rent-high">Rent: high to low</option>
                </select>
              </label>
            </div>
            {visibleFavorites.length ? (
              <div className="renter-page__grid">
                {visibleFavorites.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} showRemove onRemove={handleRemove} />
                ))}
              </div>
            ) : (
              <div className="renter-page__empty-filter">
                <EmptyState
                  title="No saved homes match"
                  description="Try another search term to find one of your saved properties."
                  action={{ label: 'Clear search', onClick: () => setSearch(''), variant: 'outline' }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RenterFavoritesPage;

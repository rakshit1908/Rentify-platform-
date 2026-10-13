import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PropertyCard    from '../../components/property/PropertyCard';
import Loader          from '../../components/common/Loader';
import EmptyState      from '../../components/common/EmptyState';
import ErrorState      from '../../components/common/ErrorState';
import { fetchFavorites, removeFavorite } from '../../services/favorites.service';
import { useFavorites } from '../../hooks/useFavorites';
import './RenterPages.css';

const NAV_ITEMS = [
  { to: '/dashboard/renter', label: 'Dashboard',       exact: true },
  { to: '/properties',       label: 'Explore Homes' },
  { to: '/renter/favorites', label: 'Saved Properties' },
  { to: '/renter/inquiries', label: 'My Inquiries' },
];

const RenterFavoritesPage = () => {
  const { ids: favIds } = useFavorites();
  const [favorites, setFavorites] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');

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
      await removeFavorite(propertyId);
      setFavorites((prev) => prev.filter((f) => f.id !== propertyId));
    } catch (err) {
      alert(err.message || 'Failed to remove.');
    }
  };

  return (
    <DashboardLayout navItems={NAV_ITEMS} role="renter">
      <div className="renter-page">
        <div className="renter-page__header">
          <h1 className="renter-page__title">Saved Properties</h1>
          <span className="renter-page__count">
            {favorites.length} saved
          </span>
        </div>

        {loading ? (
          <div className="renter-page__loader"><Loader size="md" /></div>
        ) : error ? (
          <ErrorState type="inline" title={error} onRetry={load} />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No saved properties"
            description="Browse listings and tap the heart icon to save properties you like."
            action={{ label: 'Browse Properties', onClick: () => window.location.href = '/properties' }}
          />
        ) : (
          <div className="renter-page__grid">
            {favorites.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                showRemove
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default RenterFavoritesPage;

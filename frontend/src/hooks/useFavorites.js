import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { fetchFavoriteIds, addFavorite, removeFavorite } from '../services/favorites.service';
import { useAuth } from './useAuth';

export const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used inside <FavoritesProvider>');
  return ctx;
};

/**
 * useFavoritesState — used internally by FavoritesProvider.jsx
 * Keeps all state logic here (plain JS) and lets the provider
 * supply the JSX wrapper.
 */
export const useFavoritesState = () => {
  const { isAuthenticated } = useAuth();
  const [ids, setIds]         = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { setIds(new Set()); return; }
    setLoading(true);
    fetchFavoriteIds()
      .then((res) => setIds(new Set(res.data?.ids || [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const toggle = useCallback(async (propertyId) => {
    const wasFav = ids.has(propertyId);
    // Optimistic update
    setIds((prev) => {
      const next = new Set(prev);
      wasFav ? next.delete(propertyId) : next.add(propertyId);
      return next;
    });
    try {
      if (wasFav) await removeFavorite(propertyId);
      else        await addFavorite(propertyId);
    } catch {
      // Revert on error
      setIds((prev) => {
        const next = new Set(prev);
        wasFav ? next.add(propertyId) : next.delete(propertyId);
        return next;
      });
    }
  }, [ids]);

  return { ids, loading, toggle };
};

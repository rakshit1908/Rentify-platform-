import { FavoritesContext, useFavoritesState } from '../hooks/useFavorites';

/**
 * FavoritesProvider — JSX wrapper that supplies FavoritesContext.
 * Kept in a .jsx file so Vite's OXC parser handles JSX correctly.
 */
const FavoritesProvider = ({ children }) => {
  const value = useFavoritesState();
  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;

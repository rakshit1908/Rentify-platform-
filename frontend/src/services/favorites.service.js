import api from './api';

export const fetchFavorites    = ()           => api.get('/favorites');
export const fetchFavoriteIds  = ()           => api.get('/favorites/ids');
export const addFavorite       = (propertyId) => api.post(`/favorites/${propertyId}`);
export const removeFavorite    = (propertyId) => api.delete(`/favorites/${propertyId}`);

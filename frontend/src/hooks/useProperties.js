import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchProperties } from '../services/property.service';

const DEFAULT_FILTERS = {
  search:       '',
  city:         '',
  propertyType: '',
  minRent:      '',
  maxRent:      '',
  bedrooms:     '',
  bathrooms:    '',
  amenities:    [],
  sort:         'newest',
  page:         1,
};

/** Parse URL search params into filter state */
const parseParams = (search) => {
  const p = new URLSearchParams(search);
  return {
    search:       p.get('search')       || '',
    city:         p.get('city')         || '',
    propertyType: p.get('propertyType') || '',
    minRent:      p.get('minRent')      || '',
    maxRent:      p.get('maxRent')      || '',
    bedrooms:     p.get('bedrooms')     || '',
    bathrooms:    p.get('bathrooms')    || '',
    amenities:    p.get('amenities') ? p.get('amenities').split(',') : [],
    sort:         p.get('sort')         || 'newest',
    page:         parseInt(p.get('page') || '1', 10),
  };
};

/** Serialize filter state back to URL search string */
const toSearchString = (filters) => {
  const p = new URLSearchParams();
  if (filters.search)       p.set('search',       filters.search);
  if (filters.city)         p.set('city',         filters.city);
  if (filters.propertyType) p.set('propertyType', filters.propertyType);
  if (filters.minRent)      p.set('minRent',      filters.minRent);
  if (filters.maxRent)      p.set('maxRent',      filters.maxRent);
  if (filters.bedrooms)     p.set('bedrooms',     filters.bedrooms);
  if (filters.bathrooms)    p.set('bathrooms',    filters.bathrooms);
  if (filters.amenities?.length) p.set('amenities', filters.amenities.join(','));
  if (filters.sort && filters.sort !== 'newest') p.set('sort', filters.sort);
  if (filters.page > 1)     p.set('page',         filters.page);
  const str = p.toString();
  return str ? `?${str}` : '';
};

/**
 * useProperties
 * Syncs filter/search/sort/pagination state with URL query params.
 * Fetches properties whenever the URL changes.
 */
const useProperties = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [filters, setFilters]       = useState(() => parseParams(location.search));
  const [properties, setProperties] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 12, pages: 1 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Fetch whenever URL search string changes
  useEffect(() => {
    const params = parseParams(location.search);
    setFilters(params);

    setLoading(true);
    setError('');

    const query = {
      search:        params.search       || undefined,
      city:          params.city         || undefined,
      property_type: params.propertyType || undefined,
      min_rent:      params.minRent      || undefined,
      max_rent:      params.maxRent      || undefined,
      bedrooms:      params.bedrooms     || undefined,
      bathrooms:     params.bathrooms    || undefined,
      amenities:     params.amenities?.join(',') || undefined,
      sort:          params.sort,
      page:          params.page,
      limit:         12,
    };

    fetchProperties(query)
      .then((res) => {
        setProperties(res.data?.properties || []);
        setPagination(res.data?.pagination || { total: 0, page: 1, limit: 12, pages: 1 });
      })
      .catch((err) => {
        setError(err.message || 'Failed to load properties.');
        setProperties([]);
      })
      .finally(() => setLoading(false));
  }, [location.search]);

  // Push new filter state to URL
  const applyFilters = useCallback((newFilters) => {
    navigate(`/properties${toSearchString({ ...newFilters, page: 1 })}`, { replace: false });
  }, [navigate]);

  const setFilter = useCallback((key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  }, []);

  const commitFilters = useCallback(() => {
    applyFilters(filters);
  }, [applyFilters, filters]);

  const resetFilters = useCallback(() => {
    navigate('/properties', { replace: false });
  }, [navigate]);

  const setPage = useCallback((page) => {
    const current = parseParams(location.search);
    navigate(`/properties${toSearchString({ ...current, page })}`, { replace: false });
  }, [navigate, location.search]);

  const setSort = useCallback((sort) => {
    const current = parseParams(location.search);
    navigate(`/properties${toSearchString({ ...current, sort, page: 1 })}`, { replace: false });
  }, [navigate, location.search]);

  const setSearch = useCallback((search) => {
    const current = parseParams(location.search);
    navigate(`/properties${toSearchString({ ...current, search, page: 1 })}`, { replace: false });
  }, [navigate, location.search]);

  // Count active filters (excluding sort + page + search)
  const activeFilterCount = [
    filters.city, filters.propertyType,
    filters.minRent, filters.maxRent,
    filters.bedrooms, filters.bathrooms,
  ].filter(Boolean).length + (filters.amenities?.length || 0);

  return {
    filters,
    setFilter,
    commitFilters,
    applyFilters,
    resetFilters,
    setPage,
    setSort,
    setSearch,
    properties,
    pagination,
    loading,
    error,
    activeFilterCount,
  };
};

export default useProperties;

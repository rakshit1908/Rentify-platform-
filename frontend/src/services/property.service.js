import api from './api';
import supabase from './supabase';

/**
 * property.service.js
 * All property-related API calls go through here.
 */

/* ── Public ─────────────────────────────────────────────── */

export const fetchProperties = (params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return api.get(`/properties${qs ? `?${qs}` : ''}`);
};

export const fetchPropertyById = (id) =>
  api.get(`/properties/${id}`);

export const fetchAmenities = () =>
  api.get('/properties/amenities');

/* ── Owner ──────────────────────────────────────────────── */

export const fetchMyProperties = () =>
  api.get('/properties/my-properties');

export const createProperty = (data) =>
  api.post('/properties', data);

export const updateProperty = (id, data) =>
  api.put(`/properties/${id}`, data);

export const deleteProperty = (id) =>
  api.delete(`/properties/${id}`);

export const updatePropertyStatus = (id, status) =>
  api.patch(`/properties/${id}/status`, { status });

/* ── Images ─────────────────────────────────────────────── */

/**
 * Upload images via the backend (multipart/form-data).
 * Uses raw fetch instead of api.js because we need FormData.
 */
export const uploadPropertyImages = async (propertyId, files) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/properties/${propertyId}/images`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }
  );

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.message || `Upload failed: HTTP ${res.status}`);
    err.status = res.status;
    err.errors = data?.errors;
    throw err;
  }
  return data;
};

export const deletePropertyImage = (propertyId, imageId) =>
  api.delete(`/properties/${propertyId}/images/${imageId}`);

export const setPrimaryImage = (propertyId, imageId) =>
  api.patch(`/properties/${propertyId}/images/${imageId}/primary`, {});

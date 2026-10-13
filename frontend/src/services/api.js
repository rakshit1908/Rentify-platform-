/**
 * api.js — centralised HTTP client.
 * Automatically injects the Supabase access token into every request.
 */

import supabase from './supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get the current session's access token, or null if not signed in.
 */
const getAccessToken = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

/**
 * Core fetch wrapper.
 * Throws an Error with `.message` and `.status` on non-2xx responses.
 */
const request = async (path, options = {}) => {
  const token = await getAccessToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = new Error(data?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.errors = data?.errors ?? null;
    err.data   = data;
    throw err;
  }

  return data;
};

export const api = {
  get:    (path, opts)       => request(path, { method: 'GET', ...opts }),
  post:   (path, body, opts) => request(path, { method: 'POST',   body: JSON.stringify(body), ...opts }),
  put:    (path, body, opts) => request(path, { method: 'PUT',    body: JSON.stringify(body), ...opts }),
  patch:  (path, body, opts) => request(path, { method: 'PATCH',  body: JSON.stringify(body), ...opts }),
  delete: (path, opts)       => request(path, { method: 'DELETE', ...opts }),
};

export default api;

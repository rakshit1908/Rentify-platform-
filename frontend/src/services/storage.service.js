/**
 * storage.service.js
 * Direct Supabase Storage helpers for the frontend.
 * Used for generating public URLs and any client-side Storage operations.
 * Image uploads go through the backend API (property.service.js) so the
 * service-role key is never needed here.
 */

import supabase from './supabase';

const BUCKET = 'property-images';

/** Get the public URL for a storage path */
export const getPublicUrl = (storagePath) => {
  if (!storagePath) return null;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data?.publicUrl || null;
};

/** Validate a file before upload (client-side guard) */
export const validateImageFile = (file) => {
  const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  if (!ALLOWED.includes(file.type)) {
    return { valid: false, error: `${file.name}: unsupported type. Use JPG, PNG or WEBP.` };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `${file.name}: exceeds 5 MB limit.` };
  }
  return { valid: true };
};

/** Create a local preview URL for a File object */
export const createPreviewUrl = (file) => URL.createObjectURL(file);

/** Revoke a local preview URL to free memory */
export const revokePreviewUrl = (url) => {
  if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
};

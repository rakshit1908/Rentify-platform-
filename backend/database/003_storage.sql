-- ============================================================
-- RENTIFY — SUPABASE STORAGE POLICIES (Migration 003)
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Run AFTER 001_schema.sql and 002_rls_policies.sql
-- ============================================================

-- ── Create the storage bucket ─────────────────────────────
-- Do this in Supabase Dashboard → Storage → New Bucket
-- Name: property-images
-- Public: true (so image URLs are publicly readable)
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max file size: 5 MB
--
-- OR run via SQL:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880,   -- 5 MB in bytes
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ── Storage RLS Policies ──────────────────────────────────

-- 1. Anyone can read/view images (bucket is public)
CREATE POLICY "storage: public read property-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- 2. Authenticated users can upload to their own folder
--    Path convention: property-images/{owner_id}/{property_id}/{filename}
CREATE POLICY "storage: authenticated upload property-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Owners can update their own images
CREATE POLICY "storage: owner update property-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Owners can delete their own images
CREATE POLICY "storage: owner delete property-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- RENTIFY — ROW LEVEL SECURITY POLICIES (Migration 002)
-- Run AFTER 001_schema.sql
-- ============================================================

-- ── Enable RLS on every table ──────────────────────────────
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries         ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: is current user an owner?
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
$$;

-- ============================================================
-- 1. PROFILES policies
-- ============================================================

-- Anyone authenticated can read any public profile (needed for property detail)
CREATE POLICY "profiles: authenticated users can read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Users can only update their own profile
CREATE POLICY "profiles: users update own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only service role can insert (profile created by trigger)
-- (no INSERT policy = only service_role / trigger can insert)

-- ============================================================
-- 2. PROPERTIES policies
-- ============================================================

-- Anyone (including anonymous) can read available properties
CREATE POLICY "properties: public read available"
  ON public.properties FOR SELECT
  USING (status = 'available');

-- Owners can also read their own rented properties
CREATE POLICY "properties: owner reads own"
  ON public.properties FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Only owners can insert properties
CREATE POLICY "properties: owner insert"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid() AND public.is_owner());

-- Owners can only update their own listings
CREATE POLICY "properties: owner update own"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid() AND public.is_owner());

-- Owners can only delete their own listings
CREATE POLICY "properties: owner delete own"
  ON public.properties FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- 3. PROPERTY_IMAGES policies
-- ============================================================

-- Public can read images for available properties
CREATE POLICY "property_images: public read"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.status = 'available'
    )
  );

-- Owner of the property can manage images
CREATE POLICY "property_images: owner insert"
  ON public.property_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "property_images: owner delete"
  ON public.property_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 4. AMENITIES policies  (public read-only master list)
-- ============================================================

CREATE POLICY "amenities: public read"
  ON public.amenities FOR SELECT
  USING (TRUE);

-- Only service_role can insert/update amenities (managed via SQL)

-- ============================================================
-- 5. PROPERTY_AMENITIES policies
-- ============================================================

CREATE POLICY "property_amenities: public read"
  ON public.property_amenities FOR SELECT
  USING (TRUE);

CREATE POLICY "property_amenities: owner manage"
  ON public.property_amenities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.owner_id = auth.uid()
    )
  );

-- ============================================================
-- 6. FAVORITES policies
-- ============================================================

-- Users can only see their own favorites
CREATE POLICY "favorites: user reads own"
  ON public.favorites FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can add favorites
CREATE POLICY "favorites: user insert"
  ON public.favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can remove their own favorites
CREATE POLICY "favorites: user delete own"
  ON public.favorites FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================
-- 7. INQUIRIES policies
-- ============================================================

-- Renters can read their own inquiries
CREATE POLICY "inquiries: renter reads own"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (renter_id = auth.uid());

-- Owners can read inquiries for their properties
CREATE POLICY "inquiries: owner reads for property"
  ON public.inquiries FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Renters can create inquiries
CREATE POLICY "inquiries: renter insert"
  ON public.inquiries FOR INSERT
  TO authenticated
  WITH CHECK (
    renter_id = auth.uid()
    -- Prevent owners from sending inquiries to themselves
    AND renter_id != owner_id
  );

-- Owners can update inquiry status (contacted / closed)
CREATE POLICY "inquiries: owner update status"
  ON public.inquiries FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Users can delete only their own inquiries (renter side)
CREATE POLICY "inquiries: renter delete own"
  ON public.inquiries FOR DELETE
  TO authenticated
  USING (renter_id = auth.uid());

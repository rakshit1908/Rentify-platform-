-- ============================================================
-- RENTIFY — DATABASE SCHEMA MIGRATION 001
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Enable required extensions ────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES
-- Extends auth.users (1-to-1). Created automatically on signup
-- via trigger. Never store passwords here.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT        NOT NULL DEFAULT 'renter'
                            CHECK (role IN ('renter', 'owner')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);

-- ── Auto-update updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Auto-create profile after auth.users insert ───────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'role', 'renter')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. PROPERTIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  description      TEXT,
  property_type    TEXT        NOT NULL
                               CHECK (property_type IN (
                                 'apartment', 'house', 'villa',
                                 'studio', 'pg', 'commercial', 'plot'
                               )),
  rent             NUMERIC(12,2) NOT NULL CHECK (rent > 0),
  security_deposit NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (security_deposit >= 0),
  bedrooms         SMALLINT    CHECK (bedrooms >= 0),
  bathrooms        SMALLINT    CHECK (bathrooms >= 0),
  area             NUMERIC(10,2) CHECK (area > 0),         -- sq ft
  address          TEXT        NOT NULL,
  city             TEXT        NOT NULL,
  state            TEXT        NOT NULL,
  pincode          TEXT        NOT NULL CHECK (pincode ~ '^\d{6}$'),
  latitude         NUMERIC(9,6),
  longitude        NUMERIC(9,6),
  status           TEXT        NOT NULL DEFAULT 'available'
                               CHECK (status IN ('available', 'rented')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_properties_owner_id    ON public.properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_city        ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_status      ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_rent        ON public.properties(rent);
CREATE INDEX IF NOT EXISTS idx_properties_created_at  ON public.properties(created_at DESC);

CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 3. PROPERTY_IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.property_images (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id   UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url     TEXT        NOT NULL,
  storage_path  TEXT        NOT NULL,
  is_primary    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce only one primary image per property
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_images_one_primary
  ON public.property_images(property_id)
  WHERE is_primary = TRUE;

CREATE INDEX IF NOT EXISTS idx_property_images_property_id
  ON public.property_images(property_id);

-- ============================================================
-- 4. AMENITIES  (master list — seed data at bottom)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.amenities (
  id    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name  TEXT NOT NULL UNIQUE
);

-- ============================================================
-- 5. PROPERTY_AMENITIES  (junction)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.property_amenities (
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_id  UUID NOT NULL REFERENCES public.amenities(id)  ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenity_id)
);

CREATE INDEX IF NOT EXISTS idx_property_amenities_property_id
  ON public.property_amenities(property_id);

-- ============================================================
-- 6. FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT  uq_favorites_user_property UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id     ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON public.favorites(property_id);

-- ============================================================
-- 7. INQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID        NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  renter_id   UUID        NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  owner_id    UUID        NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  message     TEXT        NOT NULL,
  phone       TEXT,
  status      TEXT        NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_renter_id   ON public.inquiries(renter_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_owner_id    ON public.inquiries(owner_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status      ON public.inquiries(status);

CREATE TRIGGER trg_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- SEED: Amenities master list
-- ============================================================
INSERT INTO public.amenities (name) VALUES
  ('WiFi'),
  ('Air Conditioning'),
  ('Heating'),
  ('Parking'),
  ('Gym'),
  ('Swimming Pool'),
  ('Security'),
  ('Power Backup'),
  ('Lift / Elevator'),
  ('CCTV'),
  ('Water Supply 24/7'),
  ('Gas Pipeline'),
  ('Furnished'),
  ('Semi-Furnished'),
  ('Pet Friendly'),
  ('Balcony'),
  ('Garden / Terrace'),
  ('Washing Machine'),
  ('Modular Kitchen'),
  ('Intercom')
ON CONFLICT (name) DO NOTHING;

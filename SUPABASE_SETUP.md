# 🚀 Rentify Supabase Setup Guide

Complete step-by-step guide to connect Rentify with Supabase.

---

## 📋 Prerequisites

- [ ] Supabase account (free tier works)
- [ ] Node.js installed
- [ ] Git installed (optional)

---

## 🔧 Step 1: Create Supabase Project

### 1.1 Sign Up / Login
1. Go to **https://supabase.com/**
2. Click **"Start your project"**
3. Sign in with GitHub / Google / Email

### 1.2 Create New Project
1. Click **"New Project"**
2. Fill in details:
   - **Name**: `rentify` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you (e.g., `Mumbai` for India)
   - **Pricing Plan**: Free
3. Click **"Create new project"**
4. **Wait 2-3 minutes** for project setup

---

## 🔑 Step 2: Get API Keys

### 2.1 Navigate to Settings
1. In Supabase Dashboard, click **"Settings"** (⚙️ icon in sidebar)
2. Click **"API"** tab

### 2.2 Copy These Values
You'll see these keys - **COPY THEM:**

```
Project URL:              https://hcgsuzfbpgsmwxgxcdsn.supabase.co
anon public key:          sb_publishable_Nu26Z0cyXXp-aoYZjjr5LA_7hpSMs6I
service_role key:         eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

⚠️ **IMPORTANT**: 
- `anon` key is safe for frontend
- `service_role` key is SECRET - never expose in frontend!

---

## 🗄️ Step 3: Create Database Schema

### 3.1 Open SQL Editor
1. In Supabase Dashboard, click **"SQL Editor"** in sidebar
2. Click **"New Query"**

### 3.2 Run Schema SQL
Copy and paste this **ENTIRE** SQL script:

```sql
-- ============================================================
-- RENTIFY DATABASE SCHEMA
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('owner', 'renter')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. PROPERTIES TABLE
-- ============================================================
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Basic info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  address TEXT NOT NULL,
  pincode TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property details
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'studio', 'penthouse')),
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  bathrooms INTEGER NOT NULL CHECK (bathrooms >= 0),
  area_sqft INTEGER NOT NULL CHECK (area_sqft > 0),
  furnished_status TEXT NOT NULL CHECK (furnished_status IN ('furnished', 'semi-furnished', 'unfurnished')),
  
  -- Amenities (stored as array)
  amenities TEXT[] DEFAULT '{}',
  
  -- Pricing
  rent_amount INTEGER NOT NULL CHECK (rent_amount > 0),
  security_deposit INTEGER NOT NULL CHECK (security_deposit >= 0),
  maintenance_charge INTEGER DEFAULT 0,
  
  -- Availability
  available_from DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'rented', 'unlisted')),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PROPERTY IMAGES TABLE
-- ============================================================
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. FAVORITES TABLE
-- ============================================================
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================================
-- 5. INQUIRIES TABLE
-- ============================================================
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  message TEXT NOT NULL,
  phone TEXT,
  preferred_move_date DATE,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'viewing_scheduled', 'closed')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_properties_owner ON public.properties(owner_id);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_created ON public.properties(created_at DESC);
CREATE INDEX idx_property_images_property ON public.property_images(property_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
CREATE INDEX idx_favorites_property ON public.favorites(property_id);
CREATE INDEX idx_inquiries_sender ON public.inquiries(sender_id);
CREATE INDEX idx_inquiries_owner ON public.inquiries(owner_id);
CREATE INDEX idx_inquiries_property ON public.inquiries(property_id);

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

3. Click **"Run"** button (bottom right)
4. ✅ You should see **"Success. No rows returned"**

---

### 3.3 Run RLS Policies

Create a **NEW QUERY** and run this:

```sql
-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- USERS POLICIES
-- ============================================================
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view public user info"
  ON public.users FOR SELECT
  USING (true);

-- ============================================================
-- PROPERTIES POLICIES
-- ============================================================
CREATE POLICY "Anyone can view available properties"
  ON public.properties FOR SELECT
  USING (status = 'available' OR owner_id = auth.uid());

CREATE POLICY "Owners can insert their properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================================
-- PROPERTY IMAGES POLICIES
-- ============================================================
CREATE POLICY "Anyone can view property images"
  ON public.property_images FOR SELECT
  USING (true);

CREATE POLICY "Owners can insert images for their properties"
  ON public.property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete images from their properties"
  ON public.property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND owner_id = auth.uid()
    )
  );

-- ============================================================
-- FAVORITES POLICIES
-- ============================================================
CREATE POLICY "Users can view their own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- INQUIRIES POLICIES
-- ============================================================
CREATE POLICY "Users can view their sent inquiries"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Owners can view inquiries for their properties"
  ON public.inquiries FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can send inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Owners can update inquiry status"
  ON public.inquiries FOR UPDATE
  USING (auth.uid() = owner_id);
```

Click **"Run"** again.

---

### 3.4 Setup Storage for Images

Create another **NEW QUERY**:

```sql
-- ============================================================
-- STORAGE SETUP FOR PROPERTY IMAGES
-- ============================================================

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Storage policies
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete their uploaded images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

Click **"Run"**.

---

## 🔐 Step 4: Configure Authentication

### 4.1 Enable Email Provider
1. Go to **"Authentication"** → **"Providers"**
2. Find **"Email"**
3. Toggle **"Enable Email provider"** ON
4. **Confirm email** should be **ENABLED** (recommended)
5. Click **"Save"**

### 4.2 Configure Email Templates (Optional)
1. Go to **"Authentication"** → **"Email Templates"**
2. Customize **"Confirm signup"** and **"Magic Link"** templates
3. Save

### 4.3 Set Site URL
1. Go to **"Authentication"** → **"URL Configuration"**
2. Set **Site URL**: `http://localhost:5173`
3. Add **Redirect URLs**:
   - `http://localhost:5173/**`
   - `http://localhost:5173/auth/callback`
4. Click **"Save"**

---

## 📝 Step 5: Update Environment Variables

### 5.1 Backend .env

Open `d:\Rentify\backend\.env` and update:

```env
# Server
NODE_ENV=development
PORT=5000

# Supabase (REPLACE WITH YOUR VALUES)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...

# JWT (use same as Supabase JWT_SECRET from Settings > API)
JWT_SECRET=your-supabase-jwt-secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Storage
STORAGE_BUCKET=property-images
MAX_FILE_SIZE=5242880
```

⚠️ **Get JWT_SECRET**:
- In Supabase Dashboard → Settings → API
- Scroll down to **"JWT Settings"**
- Copy **"JWT Secret"**

### 5.2 Frontend .env

Open `d:\Rentify\frontend\.env` and update:

```env
# Supabase (ONLY anon key - safe for frontend)
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...

# Backend API
VITE_API_URL=http://localhost:5000/api
```

⚠️ **NEVER** put `service_role` key in frontend!

---

## 🧪 Step 6: Test Connection

### 6.1 Restart Servers

Stop both servers (Ctrl+C) and restart:

```bash
# Terminal 1 - Backend
cd d:\Rentify\backend
node server.js

# Terminal 2 - Frontend
cd d:\Rentify\frontend
npm run dev
```

### 6.2 Check Backend Logs

You should see:
```
✓ Supabase credentials configured
✓ Connected to Supabase
  ╔══════════════════════════════════════╗
  ║        Rentify API — Running         ║
  ║  Port    : 5000                       ║
  ║  Env     : development               ║
  ╚══════════════════════════════════════╝
```

No warnings about missing Supabase credentials!

### 6.3 Test Registration

1. Open `http://localhost:5173/`
2. Click **"Get Started"** or **"Sign In"**
3. Click **"Create Account"**
4. Fill in:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Full Name: `Test User`
   - Phone: `9876543210`
   - Role: `Renter`
5. Click **"Register"**
6. ✅ Check email for confirmation link

---

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] API keys copied
- [ ] Schema SQL executed (no errors)
- [ ] RLS policies created (no errors)
- [ ] Storage bucket created
- [ ] Email auth enabled
- [ ] Site URL configured
- [ ] Backend .env updated
- [ ] Frontend .env updated
- [ ] Servers restarted
- [ ] No Supabase warnings in backend logs
- [ ] Registration works

---

## 🎯 Quick Reference

### Supabase Dashboard URLs

- **Project Dashboard**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
- **Table Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/editor
- **SQL Editor**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
- **Authentication**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/auth
- **Storage**: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/storage

### Tables Created

1. `users` - User profiles (extends auth.users)
2. `properties` - Property listings
3. `property_images` - Property photos
4. `favorites` - Saved properties
5. `inquiries` - Contact messages

### Storage Buckets

- `property-images` - Public bucket for property photos

---

## 🐛 Troubleshooting

### "Missing Supabase credentials" warning
- Check .env file has correct keys
- Restart backend server
- Keys should NOT have quotes or extra spaces

### "Invalid API key" error
- Copy keys again from Supabase Dashboard
- Make sure you copied the FULL key (they're very long)
- Check for line breaks in .env file

### "Row Level Security" errors
- Re-run RLS policies SQL
- Check user is authenticated
- Verify JWT token is valid

### Email confirmation not working
- Check spam folder
- Verify email provider is enabled
- Check SMTP settings (if using custom SMTP)

### Images not uploading
- Check storage bucket exists
- Verify storage policies are created
- Check file size < 5MB
- Verify bucket is PUBLIC

---

## 🚀 Next Steps

After setup is complete:

1. **Create Owner Account** - Register with role="owner"
2. **Add Sample Properties** - Test CRUD operations
3. **Test Search & Filters** - Browse properties
4. **Test Favorites** - Save/unsave properties
5. **Send Inquiries** - Contact owners
6. **Test Dashboard** - Owner/renter views

---

## 📚 Additional Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security
- **Storage**: https://supabase.com/docs/guides/storage

---

**Questions? Issues?**

Check the troubleshooting section or Supabase docs!

**Happy Building! 🎉**

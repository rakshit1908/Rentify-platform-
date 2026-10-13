# Rentify — Database Migrations

## How to apply

1. Open **Supabase Dashboard** → your project → **SQL Editor**
2. Click **New Query**
3. Paste and run `001_schema.sql` first — creates all 7 tables, indexes, triggers
4. Run `002_rls_policies.sql` — enables RLS and creates all policies

## Tables

| Table                | Purpose                                      |
|----------------------|----------------------------------------------|
| `profiles`           | Extended user data linked to `auth.users`    |
| `properties`         | Rental listings created by owners            |
| `property_images`    | Images per listing (Supabase Storage URLs)   |
| `amenities`          | Master list of amenity options               |
| `property_amenities` | Junction — which amenities a property has    |
| `favorites`          | Properties saved by renters                  |
| `inquiries`          | Messages from renters to owners              |

## Key design decisions

- `profiles.id` is a foreign key to `auth.users.id` — profile is auto-created via trigger on signup
- Service-role key is NEVER exposed to the frontend
- All tables use RLS — frontend queries go through the anon key with RLS enforced
- Backend API uses the service-role key server-side only
- Passwords are never stored — Supabase Auth handles them

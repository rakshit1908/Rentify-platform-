# 🏠 Rentify — Premium House Rental Platform

**Find a place you'll love to call home.**

Rentify is a full-stack house rental platform connecting property owners with verified renters across India. Built with modern web technologies and premium UI/UX design.

---

## ✨ Features

### For Renters
- 🔍 **Advanced Search** — Filter by location, price, property type, bedrooms, bathrooms, amenities
- 🗺️ **Interactive Maps** — View property locations with Leaflet maps
- ❤️ **Favorites** — Save properties for later viewing
- 💬 **Direct Inquiry** — Contact property owners directly
- 📱 **Responsive Design** — Seamless experience across all devices
- 🎨 **Premium UI** — Modern, accessible interface with smooth animations

### For Property Owners
- 📝 **Property Management** — Create, edit, delete, and manage property listings
- 📸 **Image Upload** — Upload multiple property images with primary image selection
- 🏷️ **Status Control** — Mark properties as available, rented, or unavailable
- 📊 **Dashboard** — Track inquiries, view statistics, manage listings
- 🔔 **Inquiry Management** — View and respond to renter inquiries
- ✅ **Status Updates** — Mark inquiries as pending, contacted, or closed

### Security & Authentication
- 🔐 **Supabase Auth** — Secure authentication with email/password
- 🔑 **Password Reset** — Forgot password and reset flows
- 👥 **Role-Based Access** — Owner and Renter roles with proper authorization
- 🛡️ **Row Level Security** — Database-level security policies
- 🚫 **Protected Routes** — Frontend and backend route protection

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — UI library with hooks
- **React Router v6** — Client-side routing with protected routes
- **Vite** — Lightning-fast build tool
- **CSS Modules** — Scoped, maintainable styles
- **Leaflet** — Interactive maps
- **Supabase Client** — Authentication and storage
- **Axios** — HTTP client

### Backend
- **Node.js** — JavaScript runtime
- **Express** — Web framework
- **Supabase** — Backend-as-a-Service (Auth, Database, Storage)
- **PostgreSQL** — Relational database (via Supabase)
- **express-validator** — Input validation
- **Multer** — File upload handling
- **Helmet** — Security headers
- **CORS** — Cross-origin resource sharing

### Database
- **PostgreSQL** (Supabase)
- **Row Level Security (RLS)** for access control
- **Foreign Key Constraints**
- **Indexes** for performance

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌─────────────┬──────────────┬────────────┬──────────────┐ │
│  │  Public     │  Auth Pages  │   Owner    │    Renter    │ │
│  │  (Browse)   │ (Login/Reg)  │ (Dashboard)│  (Dashboard) │ │
│  └─────────────┴──────────────┴────────────┴──────────────┘ │
│                          │                                   │
│                    React Router                              │
│              (Protected Routes / Role Guards)                │
└──────────────────────────┬───────────────────────────────────┘
                           │ HTTPS (REST API)
┌──────────────────────────┴───────────────────────────────────┐
│                    BACKEND (Express)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Middleware Layer                              │   │
│  │  • CORS  • Helmet  • JWT Verify  • Role Check        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         API Routes                                    │   │
│  │  /auth  /properties  /favorites  /inquiries          │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Controllers                                   │   │
│  │  Validation → Business Logic → Supabase Admin Client │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────┬───────────────────────────────────┘
                           │ Supabase Admin SDK
┌──────────────────────────┴───────────────────────────────────┐
│                   SUPABASE (BaaS)                             │
│  ┌───────────────┬─────────────────┬────────────────────┐   │
│  │   Auth        │   PostgreSQL    │   Storage          │   │
│  │  (JWT/OAuth)  │  (RLS Policies) │  (Images/Files)    │   │
│  └───────────────┴─────────────────┴────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles

### Owner
- Can create, edit, and delete their own properties
- Can upload and manage property images
- Can change property status (available/rented/unavailable)
- Can view and respond to inquiries for their properties
- Cannot access renter-specific features

### Renter
- Can browse and search properties
- Can add/remove properties to favorites
- Can send inquiries to property owners
- Can view their own inquiries and favorites
- Cannot create or modify properties

---

## 🗄️ Database Schema

```sql
-- Core Tables
├── profiles (user profiles with role)
├── properties (property listings)
├── property_images (multiple images per property)
├── favorites (user-property many-to-many)
├── inquiries (renter-owner communication)
├── messages (future: inquiry threads)
├── reviews (future: property reviews)
└── payments (future: payment tracking)
```

### Key Relationships
- `properties.owner_id` → `profiles.id` (one-to-many)
- `property_images.property_id` → `properties.id` (one-to-many)
- `favorites.user_id` + `property_id` (many-to-many with RLS)
- `inquiries.renter_id` + `owner_id` + `property_id` (tracked communication)

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/rentify.git
cd rentify
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🗃️ Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your `Project URL` and `API Keys`

### 2. Run Database Migrations
Execute SQL files in order:
```bash
backend/database/001_schema.sql
backend/database/002_rls_policies.sql
backend/database/003_storage.sql
```

Copy contents and run in Supabase SQL Editor.

### 3. Configure Storage
1. Go to Storage → Create bucket: `property-images`
2. Make bucket **public**
3. RLS policies auto-applied via migration

### 4. Configure Auth
1. Enable Email/Password provider
2. Set Site URL: `http://localhost:5173` (dev) or production URL
3. Add redirect URLs for password reset

---

## 🏃 Local Development

### Terminal 1 — Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
# Client runs on http://localhost:5173
```

### Test Accounts
Create via the Register page:
- **Owner:** `owner@example.com` / password
- **Renter:** `renter@example.com` / password

---

## 📡 API Overview

### Public Routes
```
GET  /api/health                    # Health check
GET  /api/properties                # List all properties (paginated, filterable)
GET  /api/properties/:id            # Get property details
GET  /api/properties/amenities      # Get all amenities
```

### Auth Routes
```
POST /api/auth/register             # Create account
POST /api/auth/login                # Sign in
POST /api/auth/logout               # Sign out
GET  /api/auth/me                   # Get current user
POST /api/auth/forgot-password      # Request reset
POST /api/auth/reset-password       # Reset with token
POST /api/auth/refresh              # Refresh session
```

### Owner Routes (Protected)
```
GET    /api/properties/my-properties    # Get my properties
POST   /api/properties                  # Create property
PUT    /api/properties/:id              # Update property
DELETE /api/properties/:id              # Delete property
PATCH  /api/properties/:id/status       # Update status

POST   /api/properties/:id/images       # Upload images
DELETE /api/properties/:id/images/:imageId   # Delete image
PATCH  /api/properties/:id/images/:imageId/primary  # Set primary

GET    /api/inquiries/owner             # Get inquiries for my properties
PATCH  /api/inquiries/:id/status        # Update inquiry status
GET    /api/inquiries/stats             # Get inquiry statistics
```

### Renter Routes (Protected)
```
POST   /api/favorites/:propertyId       # Add to favorites
DELETE /api/favorites/:propertyId       # Remove from favorites
GET    /api/favorites                   # Get my favorites
GET    /api/favorites/ids               # Get favorite IDs

POST   /api/inquiries                   # Send inquiry
GET    /api/inquiries/my                # Get my inquiries
```

---

## 🔒 Security

### Authentication
- ✅ JWT verification server-side
- ✅ Role-based access control (RBAC)
- ✅ Protected routes (frontend + backend)
- ✅ Session persistence with refresh

### Authorization
- ✅ Owners can only modify their own properties
- ✅ Users can only access their own favorites/inquiries
- ✅ Row Level Security (RLS) at database level

### Data Protection
- ✅ Passwords hashed with bcrypt (Supabase)
- ✅ Service role key never exposed to frontend
- ✅ Input validation on all endpoints
- ✅ CORS configured for specific origin
- ✅ Helmet.js security headers

### No Secrets Exposed
- ✅ `.env` files gitignored
- ✅ `.env.example` with placeholders
- ✅ Build checks for accidental exposure

See [SECURITY.md](./SECURITY.md) for full audit report.

---

## 📦 Production Build

### Frontend
```bash
cd frontend
npm run build
# Output: dist/ folder (ready for Vercel/Netlify)
```

### Backend
```bash
cd backend
npm start
# Production mode (no hot reload)
```

---

## 🌐 Deployment

### Frontend (Vercel/Netlify)
1. **Build Command:** `npm run build`
2. **Output Directory:** `dist`
3. **Environment Variables:**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### Backend (Render/Railway)
1. **Start Command:** `npm start`
2. **Environment Variables:**
   ```
   PORT=5000
   NODE_ENV=production
   CLIENT_URL=https://your-frontend.vercel.app
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Supabase Configuration
1. **Auth Redirect URLs:**
   - Add production frontend URL
   - Add `https://your-frontend.vercel.app/auth/reset-password`

2. **CORS:**
   - Update `backend/.env` CLIENT_URL to production frontend URL

3. **Storage:**
   - Ensure `property-images` bucket is public
   - RLS policies already configured

---

## 🎨 UI/UX Features

### Design System
- **Colors:** Deep Navy (#1e3a5f), Elegant Green (#2d7a4f), Warm Amber (#d97706)
- **Typography:** Plus Jakarta Sans font family
- **Spacing:** Consistent 8px grid system
- **Animations:** Tasteful transitions with reduced-motion support

### Components
- **PropertyCard:** Image zoom on hover, favorite toggle
- **Modal:** Backdrop blur, smooth entrance animation
- **Forms:** Enhanced focus states, validation feedback
- **Skeleton:** Shimmer loading animation
- **Navbar:** Animated active link underline

### Responsive Breakpoints
- 320px — Small phones
- 480px — Large phones
- 768px — Tablets
- 1024px — Laptops
- 1440px+ — Desktops

### Accessibility
- ✅ Keyboard navigation
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Reduced motion support
- ✅ Screen reader friendly

---

## 📊 Performance

### Build Output
```
dist/index.html              0.84 kB
dist/assets/index.css      101.31 kB (15.22 kB gzipped)
dist/assets/index.js       558.93 kB (152.70 kB gzipped)
dist/assets/leaflet.js     148.81 kB (43.38 kB gzipped)
```

### Optimizations
- ✅ Code splitting (React lazy loading ready)
- ✅ CSS minification
- ✅ Image optimization (WebP support)
- ✅ Lazy image loading
- ✅ Pagination on property lists
- ✅ Database indexes on frequent queries

---

## 🐛 Known Issues / Future Improvements

### To Do
- [ ] Add rate limiting on API routes
- [ ] Implement email notifications
- [ ] Add message threads between renter/owner
- [ ] Payment integration (Stripe/Razorpay)
- [ ] Property review system
- [ ] Advanced analytics dashboard
- [ ] Property comparison feature
- [ ] Automated tests (Jest + React Testing Library)

### Performance
- ⚠️ JS bundle > 500 KB (consider dynamic imports)
- ⚠️ Leaflet adds 148 KB (necessary for maps)

---

## 📄 License

MIT License — See LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@rentify.com (not active)

---

## 🎯 Project Status

**Status:** ✅ Production Ready (Phase 7 Complete)

All core features implemented, security audited, and ready for deployment.

---

**Built with ❤️ for modern house rental experiences**

## UI update — September 2026
The public homepage/navbar were redesigned around the Rentify premium real-estate visual system: warm white surfaces, amber/gold accents, large house imagery, hero search, featured property cards, trust strip, owner CTA, and responsive mobile navigation. The supplied Rentify house image is stored at `frontend/src/assets/rentify-house.png`. Existing authentication, API, property, favorites, inquiry, owner, and renter functionality remains routed through the existing application services.

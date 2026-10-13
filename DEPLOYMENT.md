# 🚀 Deployment Guide — Rentify

Complete guide to deploy Rentify to production.

---

## 📋 Pre-Deployment Checklist

- [x] Production build successful
- [x] All tests passed (manual testing complete)
- [x] Security audit completed
- [x] .env files configured correctly
- [x] .gitignore includes .env files
- [x] No secrets in code
- [x] CORS configured for production domain
- [x] Supabase RLS policies enabled
- [x] Database migrations run
- [x] Storage bucket configured

---

## 🗄️ Step 1: Supabase Configuration

### 1.1 Database Setup
1. Go to [supabase.com](https://supabase.com) and create project
2. Run migrations in SQL Editor:
   - `backend/database/001_schema.sql`
   - `backend/database/002_rls_policies.sql`
   - `backend/database/003_storage.sql`

### 1.2 Storage Setup
1. Go to **Storage** → Create bucket: `property-images`
2. Set bucket to **Public**
3. RLS policies applied via migration

### 1.3 Auth Configuration
1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Set **Site URL:** `https://your-frontend-domain.vercel.app`
4. Add **Redirect URLs:**
   ```
   https://your-frontend-domain.vercel.app
   https://your-frontend-domain.vercel.app/auth/reset-password
   https://your-frontend-domain.vercel.app/**
   ```

### 1.4 Get API Keys
1. Go to **Settings** → **API**
2. Copy:
   - `Project URL` (SUPABASE_URL)
   - `anon public` key (SUPABASE_ANON_KEY)
   - `service_role` key (SUPABASE_SERVICE_ROLE_KEY) **⚠️ Keep secret!**

---

## 🖥️ Step 2: Backend Deployment (Render)

### 2.1 Create Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### 2.2 Deploy Backend
1. Click **New +** → **Web Service**
2. Connect GitHub repository
3. Configure:
   - **Name:** `rentify-backend`
   - **Root Directory:** `backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or upgrade)

### 2.3 Environment Variables
Add in Render dashboard:
```
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-frontend-domain.vercel.app
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2.4 Deploy
1. Click **Create Web Service**
2. Wait for build (2-3 minutes)
3. Note deployment URL: `https://rentify-backend.onrender.com`

### 2.5 Test Backend
```bash
curl https://rentify-backend.onrender.com/api/health
# Should return: {"success":true,"message":"Server is healthy"}
```

---

## 🌐 Step 3: Frontend Deployment (Vercel)

### 3.1 Create Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 3.2 Import Project
1. Click **Add New** → **Project**
2. Import GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

### 3.3 Environment Variables
Add in Vercel dashboard:
```
VITE_API_URL=https://rentify-backend.onrender.com/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**⚠️ NEVER add SUPABASE_SERVICE_ROLE_KEY to frontend!**

### 3.4 Deploy
1. Click **Deploy**
2. Wait for build (1-2 minutes)
3. Note deployment URL: `https://rentify.vercel.app`

---

## 🔄 Step 4: Update CORS & Redirect URLs

### 4.1 Update Backend CORS
1. Go back to Render
2. Update `CLIENT_URL` environment variable:
   ```
   CLIENT_URL=https://rentify.vercel.app
   ```
3. Trigger manual redeploy

### 4.2 Update Supabase Auth
1. Go to Supabase dashboard
2. **Authentication** → **URL Configuration**
3. Update **Site URL:** `https://rentify.vercel.app`
4. Update **Redirect URLs** (add your Vercel domain)

---

## ✅ Step 5: Verification

### 5.1 Test Frontend
1. Visit `https://rentify.vercel.app`
2. Check browser console (no errors)
3. Check Network tab (API calls succeed)

### 5.2 Test Registration
1. Click **Sign Up**
2. Register new account
3. Check email for confirmation (if enabled)
4. Verify redirect to dashboard

### 5.3 Test Owner Flow
1. Login as owner
2. Create property
3. Upload images
4. Change status
5. View inquiries (if any)

### 5.4 Test Renter Flow
1. Login as renter
2. Browse properties
3. Add to favorites
4. Send inquiry
5. View my inquiries

### 5.5 Test Security
1. Try accessing `/owner/dashboard` as renter (should redirect)
2. Try accessing `/renter/favorites` as owner (should redirect)
3. Check that service role key is NOT in frontend source

---

## 🔍 Step 6: Monitoring

### 6.1 Render Logs
1. Go to Render dashboard
2. Click on your service
3. View **Logs** tab for backend errors

### 6.2 Vercel Logs
1. Go to Vercel dashboard
2. Click on deployment
3. View **Functions** tab for errors

### 6.3 Supabase Logs
1. Go to Supabase dashboard
2. **Logs** → **Query Performance**
3. Monitor slow queries

---

## 🐛 Troubleshooting

### CORS Errors
**Problem:** `Access to fetch blocked by CORS policy`

**Solution:**
1. Verify `CLIENT_URL` in backend matches frontend domain exactly
2. Ensure no trailing slash
3. Redeploy backend after changing env vars

### 401 Unauthorized
**Problem:** All API calls return 401

**Solution:**
1. Check Supabase keys are correct
2. Verify JWT token is being sent in Authorization header
3. Check Supabase project is active

### Images Not Loading
**Problem:** Property images show placeholder

**Solution:**
1. Check storage bucket is public
2. Verify RLS policies allow SELECT on `property_images`
3. Check image upload succeeded (check Supabase Storage)

### Build Failures
**Problem:** Build fails on Vercel/Render

**Solution:**
1. Check `package.json` has all dependencies
2. Verify Node version compatibility
3. Check build logs for specific errors
4. Ensure environment variables are set

### Database Connection Issues
**Problem:** Backend can't connect to Supabase

**Solution:**
1. Verify `SUPABASE_URL` format (https://xxx.supabase.co)
2. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Ensure Supabase project is not paused

---

## 📊 Performance Optimization

### 1. Enable Caching
Add headers in Vercel `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### 2. Enable Compression
Already enabled by Vercel/Render by default.

### 3. Add CDN
Consider Cloudflare for:
- DDoS protection
- Global CDN caching
- Analytics

### 4. Database Optimization
1. Add indexes on frequently queried columns (already done)
2. Enable connection pooling in Supabase (project settings)

---

## 🔐 Security Hardening

### 1. Rate Limiting
Add to backend `app.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit per IP
});
app.use('/api/', limiter);
```

### 2. Environment Variables
**Never commit:**
- `.env` files
- Service role keys
- Database passwords

**Always use:**
- Platform environment variable settings
- `.env.example` files for documentation

### 3. HTTPS
- Vercel: Automatic HTTPS
- Render: Automatic HTTPS
- Custom domain: Configure SSL certificate

---

## 📈 Monitoring & Analytics

### Recommended Services
1. **Sentry** — Error tracking
2. **LogRocket** — Session replay
3. **Google Analytics** — User analytics
4. **Vercel Analytics** — Built-in web vitals

### Setup Sentry (Optional)
```bash
npm install @sentry/react @sentry/node
```

Frontend:
```javascript
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: "your-sentry-dsn" });
```

Backend:
```javascript
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test # if you have tests
```

Vercel/Render auto-deploy on push to main by default.

---

## 📝 Post-Deployment Checklist

- [ ] Frontend accessible at production URL
- [ ] Backend health check returns 200
- [ ] User registration works
- [ ] Login/logout works
- [ ] Properties can be created (owner)
- [ ] Images upload successfully
- [ ] Favorites work (renter)
- [ ] Inquiries send successfully
- [ ] No console errors in production
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] RLS policies active
- [ ] Storage bucket public
- [ ] SSL/HTTPS enabled
- [ ] Custom domain configured (optional)

---

## 🎉 You're Live!

Your Rentify platform is now deployed and ready for users!

**Share your URLs:**
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.onrender.com`

---

## 🆘 Need Help?

- Check logs in Vercel/Render dashboards
- Review Supabase logs and query performance
- Consult [SECURITY.md](./SECURITY.md) for security questions
- Open GitHub issue for bugs

import { Routes, Route, Navigate } from 'react-router-dom';

import PageLayout         from '../components/layout/PageLayout';
import RoleProtectedRoute from './RoleProtectedRoute';

// Public
import HomePage           from '../pages/public/HomePage';
import PropertyDetailPage from '../pages/public/PropertyDetailPage';
import AboutPage          from '../pages/public/AboutPage';
import NotFoundPage       from '../pages/public/NotFoundPage';

// Auth
import LoginPage          from '../pages/auth/LoginPage';
import RegisterPage       from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from '../pages/auth/ResetPasswordPage';

// Owner
import OwnerDashboard      from '../pages/owner/OwnerDashboard';
import MyPropertiesPage    from '../pages/owner/MyPropertiesPage';
import CreatePropertyPage  from '../pages/owner/CreatePropertyPage';
import EditPropertyPage    from '../pages/owner/EditPropertyPage';
import PropertyImagesPage  from '../pages/owner/PropertyImagesPage';
import OwnerInquiriesPage  from '../pages/owner/OwnerInquiriesPage';

// Renter
import RenterDashboard     from '../pages/renter/RenterDashboard';
import RenterFavoritesPage from '../pages/renter/RenterFavoritesPage';
import RenterInquiriesPage from '../pages/renter/RenterInquiriesPage';
import RenterProfilePage   from '../pages/renter/RenterProfilePage';
import RenterPropertiesRoute from '../pages/renter/RenterPropertiesRoute';

const OwnerOnly  = ({ children }) => <RoleProtectedRoute role="owner">{children}</RoleProtectedRoute>;
const RenterOnly = ({ children }) => <RoleProtectedRoute role="renter">{children}</RoleProtectedRoute>;

const AppRouter = () => (
  <Routes>
    {/* ── Public layout (Navbar + Footer) ─────────────────── */}
    <Route element={<PageLayout />}>
      <Route index                 element={<HomePage />} />
      <Route path="properties/:id" element={<PropertyDetailPage />} />
      <Route path="about"          element={<AboutPage />} />

      <Route path="auth/login"           element={<LoginPage />} />
      <Route path="auth/register"        element={<RegisterPage />} />
      <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="auth/reset-password"  element={<ResetPasswordPage />} />

      <Route path="auth"      element={<Navigate to="/auth/login"    replace />} />
      <Route path="dashboard" element={<Navigate to="/dashboard/renter" replace />} />
      <Route path="*"         element={<NotFoundPage />} />
    </Route>

    <Route path="properties" element={<RenterPropertiesRoute />} />

    {/* ── Owner routes (no Navbar/Footer — DashboardLayout) ── */}
    <Route path="dashboard/owner"        element={<OwnerOnly><OwnerDashboard /></OwnerOnly>} />
    <Route path="owner/properties"       element={<OwnerOnly><MyPropertiesPage /></OwnerOnly>} />
    <Route path="owner/properties/new"   element={<OwnerOnly><CreatePropertyPage /></OwnerOnly>} />
    <Route path="owner/properties/:id/edit"   element={<OwnerOnly><EditPropertyPage /></OwnerOnly>} />
    <Route path="owner/properties/:id/images" element={<OwnerOnly><PropertyImagesPage /></OwnerOnly>} />
    <Route path="owner/inquiries"        element={<OwnerOnly><OwnerInquiriesPage /></OwnerOnly>} />

    {/* ── Renter routes ───────────────────────────────────── */}
    <Route path="dashboard/renter"  element={<RenterOnly><RenterDashboard /></RenterOnly>} />
    <Route path="renter/favorites"  element={<RenterOnly><RenterFavoritesPage /></RenterOnly>} />
    <Route path="renter/inquiries"  element={<RenterOnly><RenterInquiriesPage /></RenterOnly>} />
    <Route path="renter/profile"    element={<RenterOnly><RenterProfilePage /></RenterOnly>} />
  </Routes>
);

export default AppRouter;

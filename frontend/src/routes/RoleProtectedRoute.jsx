import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';

/**
 * RoleProtectedRoute
 * Wraps ProtectedRoute — also enforces a required role.
 *
 * Props:
 *   role         — 'owner' | 'renter'
 *   redirectTo   — where to send the wrong-role user (default: '/')
 *   children     — page to render when access is granted
 *
 * Behaviour:
 *   Unauthenticated → /auth/login (with `from` state)
 *   Wrong role      → redirectTo (default /)
 *   Correct role    → renders children
 */
const RoleProtectedRoute = ({ children, role, redirectTo = '/' }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <Loader fullPage label="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (user?.role !== role) {
    // Authenticated but wrong role — send to their correct dashboard
    const correctDashboard =
      user?.role === 'owner' ? '/dashboard/owner' : '/dashboard/renter';

    return (
      <Navigate
        to={redirectTo !== '/' ? redirectTo : correctDashboard}
        replace
      />
    );
  }

  return children;
};

export default RoleProtectedRoute;

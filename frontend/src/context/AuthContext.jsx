import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '../services/supabase';
import api from '../services/api';

/* ── Context shape ──────────────────────────────────────── */
const AuthContext = createContext(null);

/* ── Provider ───────────────────────────────────────────── */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);    // sanitized profile from backend
  const [session, setSession] = useState(null);    // raw Supabase session
  const [loading, setLoading] = useState(true);    // initial session check
  const [error, setError]     = useState(null);

  /* ── Fetch profile from backend (/api/auth/me) ───────── */
  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data?.user ?? null);
    } catch (err) {
      console.warn('[AuthContext] fetchProfile failed:', err.message);
      setUser(null);
    }
  }, []);

  /* ── Bootstrap: listen for Supabase auth state changes ── */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        fetchProfile().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Subscribe to future changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, s) => {
        setSession(s);
        if (s) {
          await fetchProfile();
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /* ── Auth actions ────────────────────────────────────── */

  const register = async ({ full_name, email, password, phone, role }) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', {
        full_name, email, password, phone, role,
      });
      if (res.data?.session) {
        // Backend already signed the user in — sync Supabase client session
        await supabase.auth.setSession({
          access_token:  res.data.session.access_token,
          refresh_token: res.data.session.refresh_token,
        });
      }
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.message || 'Registration failed.';
      setError(msg);
      return { success: false, message: msg, errors: err.errors };
    }
  };

  const login = async ({ email, password, role }) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (role && res.data?.user?.role !== role) {
        const accountRole = res.data?.user?.role === 'owner' ? 'owner' : 'renter';
        const msg = `This account is registered as a ${accountRole}. Choose “Login as ${accountRole}” to continue.`;
        setError(msg);
        return { success: false, message: msg };
      }

      // Sync Supabase client with the session from backend
      await supabase.auth.setSession({
        access_token:  res.data.session.access_token,
        refresh_token: res.data.session.refresh_token,
      });
      setUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      const msg = err.message || 'Sign in failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await api.post('/auth/logout');
    } catch (_) {
      // Even if backend call fails, clear client state
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const forgotPassword = async (email) => {
    setError(null);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return { success: true, message: res.message };
    } catch (err) {
      const msg = err.message || 'Request failed.';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const resetPassword = async ({ password, confirm_password, access_token }) => {
    setError(null);
    try {
      const res = await api.post('/auth/reset-password', {
        password,
        confirm_password,
        access_token,
      });
      return { success: true, message: res.message };
    } catch (err) {
      const msg = err.message || 'Password reset failed.';
      setError(msg);
      return { success: false, message: msg, errors: err.errors };
    }
  };

  const clearError = () => setError(null);

  /* ── Computed helpers ────────────────────────────────── */
  const isAuthenticated = !!session && !!user;
  const isOwner         = isAuthenticated && user?.role === 'owner';
  const isRenter        = isAuthenticated && user?.role === 'renter';

  const value = {
    // State
    user,
    session,
    loading,
    error,
    isAuthenticated,
    isOwner,
    isRenter,
    // Actions
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    clearError,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/* ── Consumer hook ──────────────────────────────────────── */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
};

export default AuthContext;

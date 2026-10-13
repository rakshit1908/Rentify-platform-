'use strict';

const { supabaseAdmin } = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/response');

/* ── Helpers ────────────────────────────────────────────── */

/**
 * Strip internal Supabase fields from a user object
 * so we never accidentally leak sensitive data.
 */
const sanitizeUser = (user, profile) => ({
  id:         profile.id,
  email:      profile.email,
  full_name:  profile.full_name,
  phone:      profile.phone   || null,
  avatar_url: profile.avatar_url || null,
  role:       profile.role,
  created_at: profile.created_at,
});

/* ── Controllers ────────────────────────────────────────── */

/**
 * POST /api/auth/register
 * 1. Create Supabase Auth user with metadata
 * 2. Trigger auto-creates profile row (see 001_schema.sql)
 * 3. Return session + sanitized user
 */
const register = async (req, res) => {
  try {
    const { full_name, email, password, phone, role } = req.body;

    // Create auth user — password hashed by Supabase, never stored by us
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,          // skip email confirmation in dev
      user_metadata: {
        full_name: full_name.trim(),
        phone:     phone?.trim() || null,
        role,
      },
    });

    if (error) {
      // Supabase returns 422 for duplicate emails
      if (error.message?.toLowerCase().includes('already registered')) {
        return sendError(res, 409, 'An account with this email already exists.');
      }
      return sendError(res, 400, error.message);
    }

    const userId = data.user.id;

    // Upsert profile in case trigger hasn't fired yet
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id:        userId,
        full_name: full_name.trim(),
        email:     email.toLowerCase().trim(),
        phone:     phone?.trim() || null,
        role,
      }, { onConflict: 'id' })
      .select()
      .single();

    if (profileErr) {
      console.error('[register] profile upsert error:', profileErr.message);
      return sendError(res, 500, 'Account created but profile setup failed. Please contact support.');
    }

    // Sign the user in to get a session token
    const { data: sessionData, error: signInErr } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInErr) {
      // Account created — just couldn't auto-login, user can log in manually
      return sendSuccess(res, 201, 'Account created successfully. Please sign in.', {
        user: sanitizeUser(data.user, profile),
        session: null,
      });
    }

    return sendSuccess(res, 201, 'Account created successfully.', {
      user:    sanitizeUser(sessionData.user, profile),
      session: {
        access_token:  sessionData.session.access_token,
        refresh_token: sessionData.session.refresh_token,
        expires_at:    sessionData.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[register] unexpected error:', err);
    return sendError(res, 500, 'Registration failed. Please try again.');
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });

    if (error) {
      // Never reveal whether email or password was wrong (security best practice)
      return sendError(res, 401, 'Invalid email or password.');
    }

    // Fetch profile
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, role, created_at')
      .eq('id', data.user.id)
      .single();

    if (profileErr || !profile) {
      return sendError(res, 404, 'User profile not found. Please contact support.');
    }

    return sendSuccess(res, 200, 'Signed in successfully.', {
      user: sanitizeUser(data.user, profile),
      session: {
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at:    data.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[login] unexpected error:', err);
    return sendError(res, 500, 'Sign in failed. Please try again.');
  }
};

/**
 * POST /api/auth/logout
 * Invalidates the user's session on the Supabase side.
 * Requires: verifyToken middleware.
 */
const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    // Sign out globally — invalidates all sessions for this user
    await supabaseAdmin.auth.admin.signOut(token);

    return sendSuccess(res, 200, 'Signed out successfully.');
  } catch (err) {
    console.error('[logout] unexpected error:', err);
    // Even if Supabase call fails, tell client to clear their token
    return sendSuccess(res, 200, 'Signed out.');
  }
};

/**
 * GET /api/auth/me
 * Returns the authenticated user's profile.
 * Requires: verifyToken middleware (sets req.profile).
 */
const me = async (req, res) => {
  try {
    return sendSuccess(res, 200, 'Profile fetched.', {
      user: req.profile,
    });
  } catch (err) {
    console.error('[me] unexpected error:', err);
    return sendError(res, 500, 'Could not fetch profile.');
  }
};

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email via Supabase.
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${process.env.CLIENT_URL}/auth/reset-password`,
      }
    );

    if (error) {
      console.error('[forgotPassword] error:', error.message);
    }

    // Always return success — never reveal whether an account exists
    return sendSuccess(
      res,
      200,
      'If an account with that email exists, a reset link has been sent.'
    );
  } catch (err) {
    console.error('[forgotPassword] unexpected error:', err);
    return sendSuccess(res, 200, 'If an account with that email exists, a reset link has been sent.');
  }
};

/**
 * POST /api/auth/reset-password
 * Updates the user's password using the reset token from the email link.
 * The frontend passes the access_token it received in the URL hash.
 */
const resetPassword = async (req, res) => {
  try {
    const { password, access_token } = req.body;

    if (!access_token) {
      return sendError(res, 400, 'Reset token is missing. Please use the link from your email.');
    }

    // Verify the reset token
    const { data: { user }, error: verifyErr } = await supabaseAdmin.auth.getUser(access_token);

    if (verifyErr || !user) {
      return sendError(res, 401, 'Reset link is invalid or has expired. Please request a new one.');
    }

    // Update password
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password }
    );

    if (updateErr) {
      return sendError(res, 400, updateErr.message);
    }

    return sendSuccess(res, 200, 'Password updated successfully. Please sign in.');
  } catch (err) {
    console.error('[resetPassword] unexpected error:', err);
    return sendError(res, 500, 'Password reset failed. Please try again.');
  }
};

/**
 * POST /api/auth/refresh
 * Exchanges a refresh_token for a new access_token.
 */
const refreshSession = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return sendError(res, 400, 'Refresh token is required.');
    }

    const { data, error } = await supabaseAdmin.auth.refreshSession({ refresh_token });

    if (error || !data.session) {
      return sendError(res, 401, 'Session expired. Please sign in again.');
    }

    return sendSuccess(res, 200, 'Session refreshed.', {
      session: {
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at:    data.session.expires_at,
      },
    });
  } catch (err) {
    console.error('[refreshSession] unexpected error:', err);
    return sendError(res, 500, 'Session refresh failed.');
  }
};

module.exports = {
  register,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
  refreshSession,
};

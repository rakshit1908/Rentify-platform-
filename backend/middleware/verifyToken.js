'use strict';

const { supabaseAdmin } = require('../config/supabase');
const { sendError }     = require('../utils/response');

/**
 * verifyToken — Express middleware.
 *
 * Reads the Bearer token from the Authorization header,
 * verifies it server-side with the Supabase Admin client
 * (which uses the service-role key — never trusts the client).
 *
 * On success, attaches req.user (Supabase auth user) and
 * req.profile (public.profiles row) to the request.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Authentication required. Please sign in.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 401, 'Malformed authorization token.');
    }

    // Verify JWT with Supabase — server-side only, never trust client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return sendError(res, 401, 'Invalid or expired session. Please sign in again.');
    }

    // Fetch profile for role-based access control
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, avatar_url, role, created_at')
      .eq('id', user.id)
      .single();

    if (profileErr || !profile) {
      return sendError(res, 401, 'User profile not found.');
    }

    req.user    = user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error('[verifyToken] Unexpected error:', err.message);
    return sendError(res, 500, 'Authentication check failed.');
  }
};

/**
 * requireRole — factory that returns a middleware enforcing a specific role.
 * Always used AFTER verifyToken.
 *
 * Usage: router.get('/owner/listings', verifyToken, requireRole('owner'), handler)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.profile) {
    return sendError(res, 401, 'Authentication required.');
  }
  if (!roles.includes(req.profile.role)) {
    return sendError(
      res,
      403,
      `Access denied. Required role: ${roles.join(' or ')}.`
    );
  }
  next();
};

module.exports = { verifyToken, requireRole };

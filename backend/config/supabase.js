'use strict';

const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

const isConfigured =
  config.supabase.url &&
  config.supabase.url.startsWith('http') &&
  config.supabase.serviceRoleKey &&
  !config.supabase.serviceRoleKey.startsWith('your_');

let supabaseAdmin = null;
let supabaseAnon  = null;

if (isConfigured) {
  /**
   * supabaseAdmin — SERVICE ROLE key.
   * Bypasses RLS. SERVER-SIDE ONLY. Never expose to frontend.
   */
  supabaseAdmin = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  /**
   * supabaseAnon — ANON key.
   * Subject to RLS. Used for public/unprivileged reads.
   */
  supabaseAnon = createClient(
    config.supabase.url,
    config.supabase.anonKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
} else {
  console.warn(
    '[supabase] Supabase credentials not configured. ' +
    'Add SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY to .env'
  );

  // Stub clients that return a descriptive error instead of crashing
  const stub = (name) => new Proxy({}, {
    get: () => () => Promise.resolve({
      data: null,
      error: { message: `Supabase not configured. Set ${name} in .env` },
    }),
  });

  supabaseAdmin = stub('SUPABASE_SERVICE_ROLE_KEY');
  supabaseAnon  = stub('SUPABASE_ANON_KEY');
}

module.exports = { supabaseAdmin, supabaseAnon };

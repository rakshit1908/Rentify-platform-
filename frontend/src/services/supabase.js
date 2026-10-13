import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url') {
  console.warn('[supabase] VITE_SUPABASE_URL is not configured. Auth will not work.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key') {
  console.warn('[supabase] VITE_SUPABASE_ANON_KEY is not configured. Auth will not work.');
}

/**
 * supabase — frontend client.
 * Uses the ANON key only — subject to RLS.
 * The service-role key is NEVER used in the frontend.
 */
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  true,   // handles password reset / magic link callbacks
    storageKey:          'rentify-auth',
  },
});

export default supabase;

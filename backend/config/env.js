'use strict';

require('dotenv').config();

const required = (key) => {
  const val = process.env[key];
  if (!val || val.startsWith('your_')) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[config] Missing required environment variable: ${key}`);
    }
    // In development, warn but don't crash so the server still starts
    console.warn(`[config] WARNING: ${key} is not set. Supabase features will fail.`);
  }
  return val || '';
};

const config = {
  port:      parseInt(process.env.PORT, 10) || 5000,
  nodeEnv:   process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5174',
  isDev:    (process.env.NODE_ENV || 'development') === 'development',

  supabase: {
    url:             required('SUPABASE_URL'),
    anonKey:         required('SUPABASE_ANON_KEY'),
    serviceRoleKey:  required('SUPABASE_SERVICE_ROLE_KEY'),
  },
};

module.exports = config;

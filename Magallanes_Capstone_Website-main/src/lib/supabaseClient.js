import { createClient } from '@supabase/supabase-js';

const getEnvOrStorage = (envKey, storageKey) => {
  const envVal = import.meta.env[envKey];
  if (envVal && !envVal.includes('your-project-id') && !envVal.includes('your_supabase')) {
    return envVal;
  }
  try {
    return localStorage.getItem(storageKey) || '';
  } catch (e) {
    return '';
  }
};

export const getSupabaseConfig = () => {
  const url = getEnvOrStorage('VITE_SUPABASE_URL', 'magallanes_supabase_url');
  const key = getEnvOrStorage('VITE_SUPABASE_PUBLISHABLE_KEY', 'magallanes_supabase_key');
  const configured = Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    !url.includes('your-project-id') &&
    !key.includes('your_supabase')
  );
  return { url, key, configured };
};

const config = getSupabaseConfig();

export const isConfigured = config.configured;

// Initialize Supabase JS Client using the PUBLISHABLE key (browser-safe, respects RLS)
export const supabase = isConfigured
  ? createClient(config.url, config.key)
  : null;

export default supabase;

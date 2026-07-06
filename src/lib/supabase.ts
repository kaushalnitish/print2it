import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

// Helper function to check if the provided URL is structurally valid
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Check if Supabase keys are fully and correctly populated
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  !!supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-id.supabase.co' && 
  isValidUrl(supabaseUrl);

// Initialize Supabase client if configured, or export null to enable local fallback mode
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are not set or are using default placeholders. ' +
    'The application is running in local fallback mode (using localStorage for persistent state). ' +
    'To connect your real database, define these secrets in your hosting environment or .env file.'
  );
} else {
  console.log('Supabase client initialized successfully! Production database connected.');
}

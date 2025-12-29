// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase environment variables not configured. Auth and database features will not work.'
  );
}

// Create Supabase client without strict Database typing
// Types will be inferred from the data passed to queries
// Run `npx supabase gen types typescript` to generate proper types from your database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey);
};

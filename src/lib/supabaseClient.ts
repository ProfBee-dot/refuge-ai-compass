
// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ptdvpvxcqvloxzemcpvk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZHZwdnhjcXZsb3h6ZW1jcHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzgxMDUsImV4cCI6MjA2MzgxNDEwNX0.-mqGNpLVtU7uQDnW36LXxq7vnjhTZe621kUW2HjJqMw"

// Create a mock client when environment variables are not available
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } }),
        order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
      }),
      order: () => Promise.resolve({ data: [], error: { message: 'Supabase not configured' } })
    }),
    insert: () => ({
      select: () => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured' } })
      })
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: { message: 'Supabase not configured' } })
    }),
  }),
});

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

// Export a flag to check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

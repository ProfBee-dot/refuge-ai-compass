// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ptdvpvxcqvloxzemcpvk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0ZHZwdnhjcXZsb3h6ZW1jcHZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyMzgxMDUsImV4cCI6MjA2MzgxNDEwNX0.-mqGNpLVtU7uQDnW36LXxq7vnjhTZe621kUW2HjJqMw"

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

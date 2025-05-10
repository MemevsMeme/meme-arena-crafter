
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise use demo mode with public values
// These are fallback values that only work for development/preview
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://supabase-demo.example.com';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.J-mDbYMMZndIqXCBjpXuRndMXGYfJh_K3Ii6gGDPLHY';

// Create a demo client when credentials are missing
const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

// Export a mock client in demo mode instead of throwing an error
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log warning for demo mode
if (isDemoMode) {
  console.warn('⚠️ Using Supabase in demo mode. Features requiring authentication will not work.');
  console.warn('Connect your project to Supabase to enable all features.');
}

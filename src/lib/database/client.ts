
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Define constant values for Supabase connection
// Instead of using process.env which is not available in browser
const supabaseUrl = "https://ezunpjcxnrfnpcsibtyb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6dW5wamN4bnJmbnBjc2lidHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDMzNzMsImV4cCI6MjA2MjQ3OTM3M30.eMCv2hMmifpFuK3e7y_tS5X0B6LqIGBNlvef3z_nPQc";

// Initialize Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Add debug information
console.info("✅ Supabase client connected successfully");

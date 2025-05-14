
// Re-export the supabase client from our integration
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

const SUPABASE_URL = "https://ezunpjcxnrfnpcsibtyb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6dW5wamN4bnJmbnBjc2lidHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDMzNzMsImV4cCI6MjA2MjQ3OTM3M30.eMCv2hMmifpFuK3e7y_tS5X0B6LqIGBNlvef3z_nPQc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

console.info("✅ Supabase client connected successfully");

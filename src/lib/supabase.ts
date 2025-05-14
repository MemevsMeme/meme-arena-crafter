
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
export const supabase = createClient(
  'https://ezunpjcxnrfnpcsibtyb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6dW5wamN4bnJmbnBjc2lidHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MDMzNzMsImV4cCI6MjA2MjQ3OTM3M30.eMCv2hMmifpFuK3e7y_tS5X0B6LqIGBNlvef3z_nPQc'
);

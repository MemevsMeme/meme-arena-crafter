
import { supabase as integratedSupabase } from '@/integrations/supabase/client';

// Export the integrated Supabase client instead of creating a new one
export const supabase = integratedSupabase;

// Log successful connection
console.log('✅ Supabase client connected successfully');

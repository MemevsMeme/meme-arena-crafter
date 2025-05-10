
import { supabase as integratedSupabase } from '@/integrations/supabase/client';
import { Database } from './types';

// Export the integrated Supabase client with proper typing
export const supabase = integratedSupabase as any;

// Log successful connection
console.log('✅ Supabase client connected successfully');

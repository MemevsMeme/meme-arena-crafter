
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

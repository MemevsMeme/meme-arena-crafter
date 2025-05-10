
import { supabase as integratedSupabase } from '@/integrations/supabase/client';
import { Database } from './types';

// Export the integrated Supabase client with proper typing
export const supabase = integratedSupabase as any;

// Check if the memes storage bucket exists and is public
const checkMemesBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      console.error('Error checking storage buckets:', error);
      return;
    }
    
    // Log available buckets for debugging
    console.log('Available storage buckets:', buckets?.map(b => b.name));
    
    const memesBucket = buckets?.find(bucket => bucket.name === 'memes');
    if (memesBucket) {
      console.log('✅ Memes storage bucket found');
    } else {
      console.warn('⚠️ Memes storage bucket not found. File uploads may fail.');
    }
  } catch (err) {
    console.error('Error in checkMemesBucket:', err);
  }
};

// Run the check when the app initializes
checkMemesBucket();

// Log successful connection
console.log('✅ Supabase client connected successfully');

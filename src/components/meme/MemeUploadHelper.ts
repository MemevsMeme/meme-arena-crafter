
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Helper function to handle meme image uploads to storage
 * 
 * @param blob Image blob to upload
 * @param fileName Desired file name
 * @param userId User ID for storage path
 * @param isGif Whether the image is a GIF
 * @returns Object with upload status and URL
 */
export async function uploadMemeImage(
  blob: Blob, 
  fileName: string, 
  userId: string, 
  isGif: boolean = false
): Promise<{ 
  success: boolean; 
  imageUrl?: string; 
  error?: string;
}> {
  try {
    console.log(`Uploading ${isGif ? 'GIF' : 'image'} to storage:`, fileName);
    
    // Create simple path: userId/fileName
    const filePath = `${userId}/${fileName}`;
    
    // Upload directly to the memes bucket
    const { data, error } = await supabase.storage
      .from('memes')
      .upload(filePath, blob, {
        cacheControl: '3600',
        upsert: true,
        contentType: isGif ? 'image/gif' : 'image/png',
      });
      
    if (error) {
      console.error('Error uploading to storage:', error);
      
      // Try creating the bucket first if it failed
      await ensureMemesBucket();
      
      // Try the upload again
      const retryResult = await supabase.storage
        .from('memes')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: isGif ? 'image/gif' : 'image/png',
        });
          
      if (retryResult.error) {
        console.error('Retry upload failed:', retryResult.error);
        return { 
          success: false, 
          error: `Upload failed: ${retryResult.error.message}` 
        };
      }
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('memes')
        .getPublicUrl(filePath);
      
      console.log('Retry upload successful:', publicUrlData.publicUrl);
      return { success: true, url: publicUrlData.publicUrl };
    }
    
    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('memes')
      .getPublicUrl(filePath);
    
    if (!publicUrlData?.publicUrl) {
      return { 
        success: false, 
        error: 'Failed to get public URL for uploaded file' 
      };
    }
    
    console.log('Upload successful, public URL:', publicUrlData.publicUrl);
    return { success: true, imageUrl: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error('Exception in uploadMemeImage:', error);
    return { 
      success: false, 
      error: `Upload error: ${error.message || 'Unknown error'}` 
    };
  }
}

/**
 * Create a record of the meme in Supabase directly, without using the memes table
 */
export async function createMemeRecord(
  imageUrl: string,
  userId: string,
  promptText: string,
  caption: string,
  challengeId?: string,
  ipfsHash?: string
): Promise<{
  success: boolean;
  memeId?: string;
  error?: string;
}> {
  try {
    // Since we're having issues with the memes table, insert directly into a simple table
    // This bypasses the foreign key constraint issues
    const { data, error } = await supabase
      .from('memes')
      .insert({
        image_url: imageUrl,
        creator_id: userId,
        prompt: promptText,  // Store as text, not as foreign key
        prompt_id: null,     // Skip the problematic foreign key
        caption: caption,
        ipfs_cid: ipfsHash || null
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating meme record:', error);
      
      // Alternative approach: Try directly inserting into storage
      const { data: storageData, error: storageError } = await supabase
        .from('storage')
        .insert({
          name: 'meme_' + Date.now(),
          bucket_id: 'memes',
          owner: userId,
          metadata: {
            caption,
            prompt: promptText,
            ipfsHash
          }
        })
        .select('id')
        .single();
        
      if (storageError) {
        console.error('Alternative storage approach failed:', storageError);
        return { success: false, error: error.message };
      }
      
      return { success: true, memeId: storageData.id };
    }

    return { success: true, memeId: data.id };
  } catch (error: any) {
    console.error('Exception in createMemeRecord:', error);
    return { success: false, error: error.message || 'Unknown error creating meme record' };
  }
}

/**
 * Helper function to ensure the memes storage bucket exists
 */
async function ensureMemesBucket(): Promise<boolean> {
  try {
    // First try to fetch the bucket to see if it exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error checking buckets:', error);
      return false;
    }
    
    const memesBucket = buckets?.find(b => b.name === 'memes');
    
    if (!memesBucket) {
      // Try to create the bucket with the storage admin user
      // Note: This requires appropriate permissions
      const { error: createError } = await supabase.rpc('create_storage_bucket', {
        bucket_name: 'memes',
        public_bucket: true
      });
      
      if (createError) {
        console.error('Error creating memes bucket via RPC:', createError);
        return false;
      }
      
      console.log('Memes bucket created successfully via RPC');
      return true;
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring memes bucket:', error);
    return false;
  }
}

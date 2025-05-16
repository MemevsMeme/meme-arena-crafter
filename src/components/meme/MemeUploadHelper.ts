
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Helper function to handle meme image uploads to storage
 * This function now prioritizes IPFS storage and only uses Supabase storage as fallback
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
  ipfsCid?: string;
  error?: string;
}> {
  try {
    console.log(`Preparing ${isGif ? 'GIF' : 'image'} for upload:`, fileName);
    
    // Create a File from blob for IPFS upload
    const file = new File([blob], fileName, { 
      type: isGif ? 'image/gif' : 'image/png' 
    });
    
    // Try IPFS upload first via Pinata
    try {
      console.log("Attempting IPFS upload through Pinata...");
      
      // Create a FormData object for the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `Meme: ${fileName}`);
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('pinata-upload', {
        body: formData
      });
      
      if (error) {
        console.warn('IPFS upload error (will try Supabase fallback):', error);
      } else if (data?.ipfsHash) {
        console.log('Successfully uploaded to IPFS with CID:', data.ipfsHash);
        
        // Return both IPFS info and a gateway URL for immediate viewing
        return { 
          success: true, 
          imageUrl: data.gatewayUrl || `https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`,
          ipfsCid: data.ipfsHash
        };
      }
    } catch (ipfsError) {
      console.warn('IPFS upload failed, using Supabase fallback:', ipfsError);
      // Continue to fallback option
    }
    
    // Fallback to Supabase Storage
    console.log("Falling back to Supabase storage upload");
    
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
      return { success: true, imageUrl: publicUrlData.publicUrl };
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
      try {
        const { error: createError } = await supabase.storage.createBucket('memes', {
          public: true
        });
        
        if (createError) {
          console.error('Error creating memes bucket:', createError);
          return false;
        }
        
        console.log('Memes bucket created successfully');
        return true;
      } catch (createBucketError) {
        console.error('Failed to create bucket:', createBucketError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring memes bucket:', error);
    return false;
  }
}

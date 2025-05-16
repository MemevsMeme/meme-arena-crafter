
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { uploadFileToIPFS, uploadFileToSupabase } from '@/lib/ipfs';

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
    console.log(`Preparing ${isGif ? 'GIF' : 'image'} for upload:`, fileName, 'User ID:', userId);
    
    // Create a File from blob for IPFS upload
    const file = new File([blob], fileName, { 
      type: isGif ? 'image/gif' : 'image/png' 
    });
    
    // First try direct Supabase upload for reliability
    console.log("Attempting direct Supabase storage upload first...");
    
    const supabaseResult = await uploadFileToSupabase(file, userId, fileName);
    
    if (supabaseResult.success) {
      console.log('Upload successful via Supabase, public URL:', supabaseResult.url);
      return { 
        success: true, 
        imageUrl: supabaseResult.url
      };
    }
    
    console.warn('Supabase upload failed, trying IPFS fallback:', supabaseResult.error);
    
    // Try IPFS upload as fallback via Pinata
    try {
      console.log("Attempting IPFS upload through Pinata...");
      
      const ipfsResult = await uploadFileToIPFS(file, `Meme: ${fileName}`);
      
      if (ipfsResult.success && ipfsResult.ipfsHash) {
        console.log('Successfully uploaded to IPFS with CID:', ipfsResult.ipfsHash);
        
        // Return both IPFS info and a gateway URL for immediate viewing
        return { 
          success: true, 
          imageUrl: ipfsResult.gatewayUrl || `https://gateway.pinata.cloud/ipfs/${ipfsResult.ipfsHash}`,
          ipfsCid: ipfsResult.ipfsHash
        };
      } else {
        console.error('IPFS upload error:', ipfsResult.error);
        return { 
          success: false, 
          error: `Upload failed: ${ipfsResult.error || 'Unknown IPFS error'}` 
        };
      }
    } catch (ipfsError) {
      console.error('IPFS upload failed:', ipfsError);
      return { 
        success: false, 
        error: `Upload failed: ${ipfsError instanceof Error ? ipfsError.message : 'Unknown IPFS error'}` 
      };
    }
  } catch (error: any) {
    console.error('Exception in uploadMemeImage:', error);
    return { 
      success: false, 
      error: `Upload error: ${error.message || 'Unknown error'}` 
    };
  }
}

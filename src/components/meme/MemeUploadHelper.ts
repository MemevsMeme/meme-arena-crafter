
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
    console.log(`Preparing ${isGif ? 'GIF' : 'image'} for upload:`, fileName);
    
    // Create a File from blob for IPFS upload
    const file = new File([blob], fileName, { 
      type: isGif ? 'image/gif' : 'image/png' 
    });
    
    // Try IPFS upload first via Pinata
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
        console.warn('IPFS upload error (will try Supabase fallback):', ipfsResult.error);
      }
    } catch (ipfsError) {
      console.warn('IPFS upload failed, using Supabase fallback:', ipfsError);
      // Continue to fallback option
    }
    
    // Fallback to Supabase Storage
    console.log("Falling back to Supabase storage upload");
    
    const supabaseResult = await uploadFileToSupabase(file, userId, fileName);
    
    if (!supabaseResult.success) {
      console.error('Supabase storage upload failed:', supabaseResult.error);
      return { 
        success: false, 
        error: `Upload failed: ${supabaseResult.error}` 
      };
    }
    
    console.log('Upload successful via Supabase, public URL:', supabaseResult.url);
    return { 
      success: true, 
      imageUrl: supabaseResult.url
    };
  } catch (error: any) {
    console.error('Exception in uploadMemeImage:', error);
    return { 
      success: false, 
      error: `Upload error: ${error.message || 'Unknown error'}` 
    };
  }
}

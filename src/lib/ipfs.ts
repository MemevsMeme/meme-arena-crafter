// Update the import statement to reference the correct path
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Upload a file to IPFS via Pinata
 * @param file File to upload
 * @param name Optional name for the file
 */
export async function uploadFileToIPFS(file: File, name?: string): Promise<{
  success: boolean;
  ipfsHash?: string;
  pinataUrl?: string;
  gatewayUrl?: string;
  error?: string;
}> {
  try {
    console.log(`Uploading file to IPFS: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Create a fresh FormData instance
    const formData = new FormData();
    formData.append('file', file);
    if (name) {
      formData.append('name', name);
    }

    console.log("FormData created successfully, sending to edge function");

    // Use the edge function to upload to Pinata with custom caching headers
    const { data, error } = await supabase.functions.invoke('pinata-upload', {
      body: formData,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      }
    });

    if (error) {
      console.error('Error uploading to IPFS:', error);
      return { success: false, error: error.message || 'Error calling IPFS upload function' };
    }
    
    if (!data || !data.ipfsHash) {
      console.error('Invalid response from IPFS upload:', data);
      return { success: false, error: 'Invalid response from IPFS upload, missing hash' };
    }

    console.log('Successfully uploaded to IPFS:', data);
    return { 
      success: true, 
      ipfsHash: data.ipfsHash,
      pinataUrl: data.pinataUrl,
      gatewayUrl: data.gatewayUrl 
    };
  } catch (error: any) {
    console.error('Exception uploading to IPFS:', error);
    return { success: false, error: error.message || 'Unknown error occurred during IPFS upload' };
  }
}

/**
 * Upload JSON data to IPFS via Pinata
 * @param content JSON content to upload
 * @param name Optional name for the content
 */
export async function uploadJsonToIPFS(content: any, name?: string): Promise<{
  success: boolean;
  ipfsHash?: string;
  pinataUrl?: string;
  gatewayUrl?: string;
  error?: string;
}> {
  try {
    console.log('Uploading JSON to IPFS:', name || 'unnamed content');
    
    const { data, error } = await supabase.functions.invoke('pinata-upload', {
      body: {
        type: 'json',
        content,
        name
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error uploading JSON to IPFS:', error);
      return { success: false, error: error.message || 'Error calling IPFS JSON upload function' };
    }
    
    if (!data || !data.ipfsHash) {
      console.error('Invalid response from IPFS JSON upload:', data);
      return { success: false, error: 'Invalid response from IPFS upload, missing hash' };
    }

    console.log('Successfully uploaded JSON to IPFS:', data);
    return { 
      success: true, 
      ipfsHash: data.ipfsHash,
      pinataUrl: data.pinataUrl,
      gatewayUrl: data.gatewayUrl 
    };
  } catch (error: any) {
    console.error('Exception uploading JSON to IPFS:', error);
    return { success: false, error: error.message || 'Unknown error occurred during IPFS JSON upload' };
  }
}

/**
 * Pin content from a URL to IPFS via Pinata
 * @param sourceUrl URL to pin
 * @param name Optional name for the content
 */
export async function pinUrlToIPFS(sourceUrl: string, name?: string): Promise<{
  success: boolean;
  ipfsHash?: string;
  pinataUrl?: string;
  gatewayUrl?: string;
  error?: string;
}> {
  try {
    console.log(`Pinning URL to IPFS: ${sourceUrl}`);
    
    const { data, error } = await supabase.functions.invoke('pinata-upload', {
      body: {
        sourceUrl,
        name
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (error) {
      console.error('Error pinning URL to IPFS:', error);
      return { success: false, error: error.message || 'Error calling IPFS URL pin function' };
    }
    
    if (!data || !data.ipfsHash) {
      console.error('Invalid response from IPFS URL pin:', data);
      return { success: false, error: 'Invalid response from IPFS upload, missing hash' };
    }

    console.log('Successfully pinned URL to IPFS:', data);
    return { 
      success: true, 
      ipfsHash: data.ipfsHash,
      pinataUrl: data.pinataUrl,
      gatewayUrl: data.gatewayUrl 
    };
  } catch (error: any) {
    console.error('Exception pinning URL to IPFS:', error);
    return { success: false, error: error.message || 'Unknown error occurred during IPFS URL pin' };
  }
}

/**
 * Get the IPFS URL for a hash using your custom gateway
 * @param ipfsHash IPFS hash (CID)
 * @returns URL to the content on your Pinata gateway
 */
export function getIpfsUrl(ipfsHash: string): string {
  if (!ipfsHash) return '';
  
  // Clean the CID if it has a protocol prefix or trailing path
  let cleanedCid = ipfsHash;
  
  // Remove ipfs:// protocol prefix if present
  if (cleanedCid.startsWith('ipfs://')) {
    cleanedCid = cleanedCid.substring(7);
  }
  
  // Remove any trailing paths or query parameters
  if (cleanedCid.includes('/') || cleanedCid.includes('?')) {
    cleanedCid = cleanedCid.split('/')[0].split('?')[0];
  }
  
  return `https://purple-accessible-wolverine-380.mypinata.cloud/ipfs/${cleanedCid}`;
}

/**
 * Simplified function to upload a file to Supabase Storage
 * @param file The file to upload 
 * @param userId User ID for the path
 * @param fileName Optional custom file name
 * @returns Result object with the upload status and URL
 */
export async function uploadFileToSupabase(
  file: File | Blob,
  userId: string,
  fileName?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Generate a unique filename if not provided
    const finalFileName = fileName || `${crypto.randomUUID()}${file instanceof File ? getFileExtension(file.name) : '.png'}`;
    
    // Create simple path: userId/finalFileName
    const filePath = `${userId}/${finalFileName}`;
    
    console.log(`Attempting upload to memes bucket: ${filePath}`);
    
    // Upload directly to the memes bucket
    const { data, error } = await supabase.storage
      .from('memes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file instanceof File ? file.type : 'image/png',
      });
      
    if (error) {
      console.error('Error uploading to storage:', error);
      
      if (error.message?.includes('bucket') || error.message?.includes('does not exist')) {
        // Try to create the bucket if it doesn't exist
        const { ensureStorageBuckets } = await import('@/integrations/supabase/client');
        await ensureStorageBuckets();
        
        // Try the upload again
        const retryResult = await supabase.storage
          .from('memes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file instanceof File ? file.type : 'image/png',
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
      
      return { 
        success: false, 
        error: `Upload error: ${error.message}` 
      };
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
    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error('Exception in uploadFileToSupabase:', error);
    return { 
      success: false, 
      error: `Upload error: ${error.message || 'Unknown error'}` 
    };
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');
  return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
}


import { uploadFileToSupabase } from '@/lib/ipfs';
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
    
    // Use enhanced uploadFileToSupabase function that tries multiple buckets
    const result = await uploadFileToSupabase(
      blob, 
      userId, 
      fileName
    );
    
    if (!result.success || !result.url) {
      console.error('Error uploading to storage:', result.error);
      toast({
        title: "Storage Upload Failed",
        description: result.error || "Could not upload image to storage",
        variant: "destructive"
      });
      return { 
        success: false, 
        error: result.error || "Failed to upload to storage" 
      };
    }
    
    console.log('Upload successful, public URL:', result.url);
    return {
      success: true,
      imageUrl: result.url
    };
  } catch (error: any) {
    const errorMessage = error.message || "Unknown error uploading image";
    console.error('Exception in uploadMemeImage:', errorMessage);
    toast({
      title: "Upload Error",
      description: errorMessage,
      variant: "destructive"
    });
    return { 
      success: false, 
      error: errorMessage
    };
  }
}

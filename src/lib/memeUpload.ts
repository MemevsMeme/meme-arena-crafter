
import { supabase } from '@/integrations/supabase/client';
import { Meme } from './types';

/**
 * Upload a meme to storage and create a database record
 */
export async function uploadMeme(formData: FormData, meme: Partial<Meme>): Promise<{
  publicUrl?: string;
  ipfsCid?: string;
  error?: any;
}> {
  try {
    // Extract the file from form data
    const file = formData.get('file') as File;
    if (!file) {
      return { error: 'No file provided' };
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `${meme.creatorId}_${timestamp}.png`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('memes')
      .upload(fileName, file);
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return { error: uploadError };
    }
    
    // Get the public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('memes')
      .getPublicUrl(uploadData?.path || '');
      
    if (!publicUrl) {
      return { error: 'Failed to get public URL' };
    }
    
    // Create the meme record in the database
    const { data: memeData, error: memeError } = await supabase
      .from('memes')
      .insert({
        prompt: meme.prompt,
        prompt_id: meme.prompt_id,
        image_url: publicUrl,
        ipfs_cid: null, // No IPFS for now
        caption: meme.caption,
        creator_id: meme.creatorId,
        tags: meme.tags || [],
        battle_id: meme.battleId,
        is_battle_submission: meme.isBattleSubmission
      })
      .select('*')
      .single();
      
    if (memeError) {
      console.error('Error creating meme record:', memeError);
      return { error: memeError };
    }
    
    return { 
      publicUrl, 
      ipfsCid: null 
    };
  } catch (error) {
    console.error('Unexpected error in uploadMeme:', error);
    return { error };
  }
}

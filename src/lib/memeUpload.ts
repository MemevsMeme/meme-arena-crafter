
import { supabase } from '@/integrations/supabase/client';
import { Meme } from './types';
import { uploadFileToIPFS, uploadFileToSupabase } from './ipfs';

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
      console.error('No file provided in formData');
      return { error: 'No file provided' };
    }

    // First, try to upload to IPFS
    console.log('Uploading meme to IPFS...', file.name, file.type, file.size);
    const ipfsResult = await uploadFileToIPFS(file, `Meme: ${meme.caption || 'Untitled'}`);
    
    let ipfsCid = null;
    let imageUrl = null;
    
    if (ipfsResult.success && ipfsResult.ipfsHash) {
      console.log('Successfully uploaded to IPFS with CID:', ipfsResult.ipfsHash);
      ipfsCid = ipfsResult.ipfsHash;
      imageUrl = ipfsResult.gatewayUrl || `https://gateway.pinata.cloud/ipfs/${ipfsResult.ipfsHash}`;
    } else {
      console.warn('IPFS upload failed, falling back to Supabase storage:', ipfsResult.error);
    }
    
    // Always upload to Supabase storage as well (as backup)
    console.log('Also uploading to Supabase storage for redundancy...');
    
    // Generate a unique filename
    const timestamp = Date.now();
    const fileName = `${meme.creatorId || 'anonymous'}_${timestamp}.png`;
    
    const supabaseResult = await uploadFileToSupabase(
      file,
      meme.creatorId || 'anonymous',
      fileName
    );
    
    if (supabaseResult.success && supabaseResult.url) {
      console.log('Successfully uploaded to Supabase storage:', supabaseResult.url);
      
      // If IPFS failed, use Supabase URL
      if (!imageUrl) {
        imageUrl = supabaseResult.url;
      }
    } else {
      console.warn('Supabase storage upload failed:', supabaseResult.error);
      
      // If both uploads failed, return error
      if (!imageUrl) {
        return { error: 'Failed to upload image to both IPFS and Supabase storage' };
      }
    }
    
    // Prepare basic insert data with only the essential fields
    // IMPORTANT: Do not include prompt_id by default - we'll check if it exists first
    const insertData = {
      prompt: meme.prompt || '',
      caption: meme.caption || '',
      creator_id: meme.creatorId || '',
      tags: meme.tags || [],
      image_url: imageUrl,
      ipfs_cid: ipfsCid
    };
    
    // Only try to use prompt_id if it's a valid UUID
    if (meme.prompt_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meme.prompt_id)) {
      // Before adding prompt_id, verify it exists in the prompts table
      const { data: promptExists, error: promptCheckError } = await supabase
        .from('prompts')
        .select('id')
        .eq('id', meme.prompt_id)
        .single();
      
      if (promptExists) {
        console.log('Verified prompt_id exists in prompts table:', meme.prompt_id);
        Object.assign(insertData, { prompt_id: meme.prompt_id });
      } else {
        console.log('prompt_id not found in prompts table, using only the prompt text:', meme.prompt);
        // Do not add prompt_id to avoid foreign key constraint error
      }
      
      if (promptCheckError) {
        console.log('Error checking prompt_id, will not include it:', promptCheckError);
      }
    } else {
      console.log('No valid prompt_id provided:', meme.prompt_id);
    }
    
    // Log what we're sending to the database
    console.log('Final insertion data for meme:', insertData);
    
    // Insert the meme record
    const { data: memeData, error: memeError } = await supabase
      .from('memes')
      .insert(insertData)
      .select('*')
      .single();
      
    if (memeError) {
      console.error('Error creating meme record:', memeError);
      return { error: memeError };
    }
    
    console.log('Successfully saved meme with ID:', memeData.id);
    return { 
      publicUrl: imageUrl, 
      ipfsCid 
    };
  } catch (error) {
    console.error('Unexpected error in uploadMeme:', error);
    return { error };
  }
}

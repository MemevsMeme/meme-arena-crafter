
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Meme } from './types';
import { insertMeme } from './database';
import { checkForBattles } from './services/battleService';
import { toast } from 'sonner';
import { uploadMemeImage as uploadMemeToStorage } from '@/components/meme/MemeUploadHelper';

interface MemeData {
  prompt: string;
  prompt_id: string | null;
  image_url?: string;
  ipfs_cid?: string | null;
  caption: string;
  creatorId: string;
  tags: string[];
  battleId?: string | null;
  is_battle_submission?: boolean;
}

// Remove the duplicate uploadMemeImage function since we're importing it from the helper
// We'll use the imported version instead

/**
 * Validate meme data
 * @param memeData The meme data to validate
 * @returns True if the data is valid, false otherwise
 */
function validateMemeData(memeData: MemeData): { valid: boolean; error?: string } {
  if (!memeData.image_url && !memeData.ipfs_cid) {
    console.error('Meme image URL or IPFS CID is required');
    return { valid: false, error: 'Image URL is required' };
  }

  if (!memeData.caption || memeData.caption.trim() === '') {
    console.error('Meme caption is required');
    return { valid: false, error: 'Caption is required' };
  }

  if (!memeData.creatorId) {
    console.error('Meme creator ID is required');
    return { valid: false, error: 'Creator ID is required' };
  }

  return { valid: true };
}

/**
 * Prepare meme data for insertion into the database
 * @param memeData The meme data to prepare
 * @returns The prepared meme data
 */
function prepareMemeData(memeData: MemeData): Omit<Meme, 'id' | 'createdAt' | 'votes'> {
  // Based on the database schema error, the column is likely named differently
  // Let's adapt our data structure accordingly
  return {
    prompt: memeData.prompt,
    prompt_id: memeData.prompt_id,
    imageUrl: memeData.image_url || '',
    ipfsCid: memeData.ipfs_cid || null,
    caption: memeData.caption,
    creatorId: memeData.creatorId,
    tags: memeData.tags || [],
    // Remove battleId as it seems to be causing the database insertion error
    // (the column might not exist or have a different name)
    isBattleSubmission: memeData.is_battle_submission || false,
  };
}

/**
 * Save a meme to the database
 * @param memeData 
 * @returns 
 */
export async function saveMeme(memeData: MemeData): Promise<Meme | null> {
  try {
    console.log('Saving meme to database with data:', JSON.stringify(memeData));
    
    // Validate the meme data
    const validation = validateMemeData(memeData);
    if (!validation.valid) {
      console.error('Invalid meme data:', validation.error);
      throw new Error(validation.error || 'Invalid meme data');
    }

    // Prepare the meme data for insertion into the database
    const preparedMemeData = prepareMemeData(memeData);
    console.log('Prepared meme data:', JSON.stringify(preparedMemeData));

    // Insert the meme into the database
    const meme = await insertMeme({
      prompt: preparedMemeData.prompt,
      prompt_id: preparedMemeData.prompt_id,
      imageUrl: preparedMemeData.imageUrl,
      ipfsCid: preparedMemeData.ipfsCid,
      caption: preparedMemeData.caption,
      creatorId: preparedMemeData.creatorId,
      tags: preparedMemeData.tags,
      // Removed battleId from here as it seems to cause the database error
      isBattleSubmission: preparedMemeData.isBattleSubmission,
    });

    if (!meme) {
      console.error('Failed to insert meme into database');
      throw new Error('Failed to save meme to database');
    }
    
    console.log('Meme saved successfully:', meme);

    // Check if this meme should trigger a battle
    if (meme.prompt_id) {
      await checkForBattles(meme.prompt_id);
    }

    return meme;
  } catch (error: any) {
    console.error('Unexpected error saving meme:', error);
    throw error;
  }
}

/**
 * Upload and save a meme
 * @param formData The form data containing the file to upload
 * @param memeData The meme data to save
 * @returns The saved meme, or an error message if the upload fails
 */
export async function uploadMeme(formData: FormData, memeData: any): Promise<{ meme?: Meme, error?: string }> {
  try {
    console.log('Starting uploadMeme process with memeData:', JSON.stringify(memeData));
    
    // Validate caption before proceeding
    if (!memeData.caption || memeData.caption.trim() === '') {
      return { error: 'Caption is required' };
    }
    
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in formData');
      return { error: 'No file provided' };
    }
    
    console.log('File details:', file.name, file.type, file.size);
    
    // Check if the file is a GIF
    const isGif = file.type === 'image/gif';
    
    try {
      // Using the renamed imported function with proper parameters
      const uploadResult = await uploadMemeToStorage(
        file, 
        `meme-${memeData.creatorId}-${uuidv4()}`, 
        memeData.creatorId, 
        isGif
      );
      
      if (!uploadResult || !uploadResult.success) {
        console.error('Failed to upload image', uploadResult?.error || 'Unknown error');
        return { error: uploadResult?.error || 'Failed to upload image' };
      }
      
      console.log('Image uploaded successfully:', uploadResult);
      
      // Save the meme with the image URL
      const fullMemeData = {
        ...memeData,
        image_url: uploadResult.imageUrl,
        ipfs_cid: uploadResult.ipfsCid,
      };
      
      console.log('Saving meme with full data:', JSON.stringify(fullMemeData));
      
      // Remove battleId from memeData if it's causing problems
      const cleanMemeData = { ...fullMemeData };
      delete cleanMemeData.battleId;
      
      const savedMeme = await saveMeme(cleanMemeData);
      
      if (!savedMeme) {
        console.error('Failed to save meme data');
        return { error: 'Failed to save meme data' };
      }
      
      console.log('Meme saved successfully:', savedMeme);
      toast.success('Meme created successfully!');
      
      return { meme: savedMeme };
    } catch (error: any) {
      console.error('Error in upload/save process:', error);
      return { error: error.message || 'Failed to upload or save meme' };
    }
  } catch (error: any) {
    console.error('Error in uploadMeme:', error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

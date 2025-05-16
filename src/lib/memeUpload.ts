
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

/**
 * Upload a meme image to Supabase storage
 * @param file The image file to upload
 * @param userId The ID of the user uploading the image
 * @returns The public URL of the uploaded image, or null if the upload fails
 */
export async function uploadMemeImage(file: File, userId: string): Promise<string | null> {
  try {
    console.log('Starting meme image upload...');
    
    // Generate a unique file name
    const imageName = `meme-${userId}-${uuidv4()}`;
    const imagePath = `${userId}/${imageName}`;
    
    console.log('Uploading to path:', imagePath);

    // Upload the image to Supabase storage
    const { data, error } = await supabase.storage
      .from('memes')
      .upload(imagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image to Supabase storage:', error);
      return null;
    }
    
    console.log('Image upload successful:', data.path);

    // Get the public URL of the uploaded image
    const imageUrl = `https://ezunpjcxnrfnpcsibtyb.supabase.co/storage/v1/object/public/memes/${imagePath}`;
    console.log('Image URL:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return null;
  }
}

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
  return {
    prompt: memeData.prompt,
    prompt_id: memeData.prompt_id,
    imageUrl: memeData.image_url || '',
    ipfsCid: memeData.ipfs_cid || null,
    caption: memeData.caption,
    creatorId: memeData.creatorId,
    tags: memeData.tags || [],
    battleId: memeData.battleId || null,
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
      battleId: preparedMemeData.battleId,
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
    
    // Use enhanced upload helper for more reliable storage
    // Updated to use the renamed imported function
    const uploadResult = await uploadMemeToStorage(
      file, 
      `meme-${memeData.creatorId}`, 
      memeData.creatorId, 
      isGif
    );
    
    if (!uploadResult || !uploadResult.success) {
      console.error('Failed to upload image', uploadResult?.error || 'Unknown error');
      return { error: uploadResult?.error || 'Failed to upload image' };
    }
    
    console.log('Image uploaded successfully:', uploadResult);
    
    // Save the meme with the image URL and optional IPFS CID
    const fullMemeData = {
      ...memeData,
      image_url: uploadResult.imageUrl,
      ipfs_cid: uploadResult.ipfsCid,
    };
    
    console.log('Saving meme with full data:', JSON.stringify(fullMemeData));
    
    try {
      const savedMeme = await saveMeme(fullMemeData);
      
      if (!savedMeme) {
        console.error('Failed to save meme data');
        return { error: 'Failed to save meme data' };
      }
      
      console.log('Meme saved successfully:', savedMeme);
      toast.success('Meme created successfully!');
      
      return { meme: savedMeme };
    } catch (error: any) {
      console.error('Error saving meme:', error);
      return { error: error.message || 'Failed to save meme data' };
    }
  } catch (error: any) {
    console.error('Error in uploadMeme:', error);
    return { error: error.message || 'An unexpected error occurred' };
  }
}

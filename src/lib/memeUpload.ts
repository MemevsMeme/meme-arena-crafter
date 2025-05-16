import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { Meme } from './types';
import { insertMeme } from './database';
import { checkForBattles } from './services/battleService';

interface MemeData {
  prompt: string;
  prompt_id: string | null;
  image_url: string;
  ipfs_cid: string | null;
  caption: string;
  creator_id: string;
  tags: string[];
  battle_id?: string | null;
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
    // Generate a unique file name
    const imageName = `meme-${userId}-${uuidv4()}`;
    const imagePath = `${userId}/${imageName}`;

    // Upload the image to Supabase storage
    const { data, error } = await supabase.storage
      .from('memes')
      .upload(imagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get the public URL of the uploaded image
    const imageUrl = `https://ezunpjcxnrfnpcsibtyb.supabase.co/storage/v1/object/public/memes/${imagePath}`;
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
function validateMemeData(memeData: MemeData): boolean {
  if (!memeData.image_url) {
    console.error('Meme image URL is required');
    return false;
  }

  if (!memeData.caption) {
    console.error('Meme caption is required');
    return false;
  }

  if (!memeData.creator_id) {
    console.error('Meme creator ID is required');
    return false;
  }

  return true;
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
    imageUrl: memeData.image_url,
    ipfsCid: memeData.ipfs_cid,
    caption: memeData.caption,
    creatorId: memeData.creator_id,
    tags: memeData.tags,
    battleId: memeData.battle_id || null,
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
    // Validate the meme data
    if (!validateMemeData(memeData)) {
      console.error('Invalid meme data');
      return null;
    }

    // Prepare the meme data for insertion into the database
    const preparedMemeData = prepareMemeData(memeData);

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
      console.error('Failed to insert meme');
      return null;
    }

    // Check if this meme should trigger a battle
    if (meme.prompt_id) {
      await checkForBattles(meme.prompt_id);
    }

    return meme;
  } catch (error) {
    console.error('Unexpected error saving meme:', error);
    return null;
  }
}

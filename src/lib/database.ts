
import { supabase } from '@/integrations/supabase/client';

export async function getMemes() {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*');
    
    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error getting memes:', error);
    return [];
  }
}

export async function getMemeById(id: string) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching meme by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting meme by ID:', error);
    return null;
  }
}

export async function createMeme(memeData: {
  prompt: string;
  prompt_id?: string | null;
  imageUrl: string;
  ipfsCid?: string;
  caption: string;
  creatorId: string;
  votes: number;
  createdAt: Date;
  tags: string[];
}) {
  console.log('Creating meme with data:', memeData);
  
  try {
    // Create a clean data object without undefined or invalid values
    // IMPORTANT: Convert camelCase to snake_case field names for Supabase
    const cleanData = {
      prompt: memeData.prompt,
      image_url: memeData.imageUrl, // Changed from imageUrl to image_url
      caption: memeData.caption,
      creator_id: memeData.creatorId,
      votes: memeData.votes || 0,
      created_at: memeData.createdAt,
      tags: memeData.tags || []
    };
    
    // Only add prompt_id if it's valid (not null or undefined)
    if (memeData.prompt_id) {
      Object.assign(cleanData, { prompt_id: memeData.prompt_id });
    }
    
    // Only add ipfsCid if it's valid
    if (memeData.ipfsCid) {
      Object.assign(cleanData, { ipfs_cid: memeData.ipfsCid });
    }
    
    // Insert the meme into the database
    const { data, error } = await supabase
      .from('memes')
      .insert(cleanData)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting meme:', error);
      throw new Error(`Failed to create meme record in database: ${error.message}`);
    }
    
    console.log('Meme inserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating meme:', error);
    throw error;
  }
}

export async function updateMeme(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating meme:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating meme:', error);
    return null;
  }
}

export async function deleteMeme(id: string) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting meme:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting meme:', error);
    return false;
  }
}

// Stub functions to resolve build errors. These should be implemented later.
export const getProfile = () => console.warn('getProfile not implemented');
export const createProfile = () => console.warn('createProfile not implemented');
export const updateProfile = () => console.warn('updateProfile not implemented');
export const getDailyChallenge = () => console.warn('getDailyChallenge not implemented');
export const getCurrentDayOfYear = () => console.warn('getCurrentDayOfYear not implemented');
export const getBattleById = () => console.warn('getBattleById not implemented');
export const getPromptById = () => console.warn('getPromptById not implemented');
export const castVote = () => console.warn('castVote not implemented');
export const getActiveBattles = () => console.warn('getActiveBattles not implemented');
export const getPrompts = () => console.warn('getPrompts not implemented');
export const createPrompt = () => console.warn('createPrompt not implemented');
export const getTrendingMemes = () => console.warn('getTrendingMemes not implemented');
export const getNewestMemes = () => console.warn('getNewestMemes not implemented');
export const getMemesByUserId = () => console.warn('getMemesByUserId not implemented');


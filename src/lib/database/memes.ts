// Only updating the relevant functions, keeping everything else the same

import { supabase } from './client';
import { Meme } from '../types';

/**
 * Get a meme by ID
 * @param memeId 
 */
export async function getMemeById(memeId: string): Promise<Meme | null> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('id', memeId)
      .single();

    if (error) {
      console.error('Error fetching meme:', error);
      return null;
    }

    if (!data) {
      console.log('No meme found with id:', memeId);
      return null;
    }

    return mapMeme(data);
  } catch (error) {
    console.error('Unexpected error fetching meme:', error);
    return null;
  }
}

/**
 * Get the newest memes
 * @param count 
 */
export async function getNewestMemes(count: number = 10): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    if (!data) {
      console.log('No memes found');
      return [];
    }

    return data.map(mapMeme);
  } catch (error) {
    console.error('Unexpected error fetching memes:', error);
    return [];
  }
}

/**
 * Get the trending memes (most votes)
 * @param count 
 */
export async function getTrendingMemes(count: number = 10): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('votes', { ascending: false })
      .limit(count);

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    if (!data) {
      console.log('No memes found');
      return [];
    }

    return data.map(mapMeme);
  } catch (error) {
    console.error('Unexpected error fetching memes:', error);
    return [];
  }
}

/**
 * Get memes by user ID
 * @param userId 
 * @param count 
 * @param offset 
 */
export async function getMemesByUserId(userId: string, count: number = 10, offset: number = 0): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + count - 1);

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    if (!data) {
      console.log('No memes found for user:', userId);
      return [];
    }

    return data.map(mapMeme);
  } catch (error) {
    console.error('Unexpected error fetching memes:', error);
    return [];
  }
}

/**
 * Get memes by prompt ID
 * @param promptId 
 * @param count 
 * @param offset 
 */
export async function getMemesByPromptId(promptId: number, count: number = 10, offset: number = 0): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: false })
      .range(offset, offset + count - 1);

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    if (!data) {
      console.log('No memes found for prompt:', promptId);
      return [];
    }

    return data.map(mapMeme);
  } catch (error) {
    console.error('Unexpected error fetching memes:', error);
    return [];
  }
}

/**
 * Get memes by battle ID
 * @param battleId 
 * @param count 
 * @param offset 
 */
export async function getMemesByBattleId(battleId: string, count: number = 10, offset: number = 0): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('battle_id', battleId)
      .order('created_at', { ascending: false })
      .range(offset, offset + count - 1);

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    if (!data) {
      console.log('No memes found for battle:', battleId);
      return [];
    }

    return data.map(mapMeme);
  } catch (error) {
    console.error('Unexpected error fetching memes:', error);
    return [];
  }
}

// Map database fields to frontend model fields
export function mapMeme(data: any): Meme {
  // Check if we have required fields
  if (!data || !data.id) {
    console.error('Invalid meme data:', data);
    throw new Error('Invalid meme data');
  }
  
  // Make sure image_url is present and valid
  if (!data.image_url) {
    console.warn('Meme missing image_url:', data.id);
  }
  
  return {
    id: data.id,
    prompt: data.prompt || '',
    prompt_id: data.prompt_id || null,
    imageUrl: data.image_url || '',
    ipfsCid: data.ipfs_cid || null,
    caption: data.caption || '',
    creatorId: data.creator_id || '',
    votes: data.votes || 0,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    tags: data.tags || [],
    battleId: data.battle_id || null,  
    isBattleSubmission: data.is_battle_submission || false,
  };
}

/**
 * Insert a new meme
 * @param meme 
 */
export async function insertMeme(meme: Omit<Meme, 'id' | 'createdAt' | 'votes'>): Promise<Meme | null> {
  try {
    console.log('Inserting meme into database:', meme);
    
    // Make sure we have all required fields
    if (!meme.imageUrl) {
      console.error('Cannot insert meme: imageUrl is required');
      return null;
    }
    
    // Caption is now optional, provide a default empty string
    const caption = meme.caption || '';
    
    if (!meme.creatorId) {
      console.error('Cannot insert meme: creatorId is required');
      return null;
    }
    
    // Prepare the data for insertion, removing any fields that don't exist in the database
    const memeData = {
      prompt: meme.prompt || null,
      prompt_id: null, // Force null to avoid foreign key constraint errors
      image_url: meme.imageUrl,
      ipfs_cid: meme.ipfsCid || null,
      caption: caption,
      creator_id: meme.creatorId,
      tags: meme.tags || [],
      // Removed battle_id to match the database schema
      is_battle_submission: meme.isBattleSubmission || false,
    };
    
    console.log('Final meme data being inserted:', memeData);
    
    const { data, error } = await supabase
      .from('memes')
      .insert(memeData)
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting meme:', error);
      return null;
    }

    if (!data) {
      console.log('Failed to insert meme');
      return null;
    }
    
    console.log('Meme inserted successfully:', data);

    return mapMeme(data);
  } catch (error) {
    console.error('Unexpected error inserting meme:', error);
    return null;
  }
}

/**
 * Update a meme
 * @param memeId 
 * @param meme 
 */
export async function updateMeme(memeId: string, meme: Partial<Meme>): Promise<Meme | null> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .update({
        prompt: meme.prompt,
        prompt_id: meme.prompt_id,
        image_url: meme.imageUrl,
        ipfs_cid: meme.ipfsCid,
        caption: meme.caption,
        creator_id: meme.creatorId,
        votes: meme.votes,
        tags: meme.tags,
        battle_id: meme.battleId,
        is_battle_submission: meme.isBattleSubmission,
      })
      .eq('id', memeId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating meme:', error);
      return null;
    }

    if (!data) {
      console.log('Meme not found with id:', memeId);
      return null;
    }

    return mapMeme(data);
  } catch (error) {
    console.error('Unexpected error updating meme:', error);
    return null;
  }
}

/**
 * Delete a meme
 * @param memeId 
 */
export async function deleteMeme(memeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('memes')
      .delete()
      .eq('id', memeId);

    if (error) {
      console.error('Error deleting meme:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting meme:', error);
    return false;
  }
}

// Update the increment vote functions to use the correct RPC function names
export async function incrementMemeVote(memeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('increment_meme_vote', {
      meme_id: memeId
    });
    
    if (error) {
      console.error('Error incrementing meme vote:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error incrementing meme vote:', error);
    return false;
  }
}

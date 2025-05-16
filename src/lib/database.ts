
import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase';
import { Prompt, Meme, Battle } from './types';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Get the current day of the year (1-366)
 */
export function getCurrentDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

/**
 * Get a daily challenge by day of year
 * @param dayOfYear 
 */
export async function getDailyChallenge(dayOfYear: number): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('daily_prompts')
      .select('*')
      .eq('day_of_year', dayOfYear)
      .single();

    if (error) {
      console.error('Error fetching daily prompt:', error);
      return null;
    }

    if (!data) {
      console.log('No daily prompt found for day:', dayOfYear);
      return null;
    }

    // Map database fields to frontend model fields
    const prompt: Prompt = {
      id: data.id,
      text: data.prompt_text,
      theme: data.theme || null,
      tags: data.tags || [],
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    return prompt;
  } catch (error) {
    console.error('Unexpected error fetching daily prompt:', error);
    return null;
  }
}

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
function mapMeme(data: any): Meme {
  return {
    id: data.id,
    prompt: data.prompt || '',
    prompt_id: data.prompt_id || null,
    imageUrl: data.image_url || '',
    ipfsCid: data.ipfs_cid || null,
    caption: data.caption || '',
    creatorId: data.creator_id || '',
    votes: data.votes || 0,
    createdAt: new Date(data.created_at),
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
    const { data, error } = await supabase
      .from('memes')
      .insert({
        prompt: meme.prompt,
        prompt_id: meme.prompt_id,
        image_url: meme.imageUrl,
        ipfs_cid: meme.ipfsCid,
        caption: meme.caption,
        creator_id: meme.creatorId,
        tags: meme.tags,
        battle_id: meme.battleId,
        is_battle_submission: meme.isBattleSubmission,
      })
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

export async function incrementBattleVote(memeId: string, battleId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('increment_battle_vote', {
      meme_id: memeId,
      battle_id: battleId
    });
    
    if (error) {
      console.error('Error incrementing battle vote:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error incrementing battle vote:', error);
    return false;
  }
}

/**
 * Get active battles
 * @param count 
 * @param offset 
 * @param status 'active' | 'completed' | 'all'
 */
export async function getActiveBattles(count: number = 10, offset: number = 0, status: 'active' | 'completed' | 'all' = 'active'): Promise<Battle[]> {
  try {
    let query = supabase
      .from('battles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + count - 1);

    if (status === 'active') {
      query = query.eq('status', 'active');
    } else if (status === 'completed') {
      query = query.eq('status', 'completed');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching battles:', error);
      return [];
    }

    if (!data) {
      console.log('No battles found');
      return [];
    }

    return data.map(mapBattle);
  } catch (error) {
    console.error('Unexpected error fetching battles:', error);
    return [];
  }
}

/**
 * Get battle by ID
 * @param battleId 
 */
export async function getBattleById(battleId: string): Promise<Battle | null> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (error) {
      console.error('Error fetching battle:', error);
      return null;
    }

    if (!data) {
      console.log('No battle found with id:', battleId);
      return null;
    }

    return mapBattle(data);
  } catch (error) {
    console.error('Unexpected error fetching battle:', error);
    return null;
  }
}

/**
 * Insert a new battle
 * @param battle 
 */
export async function insertBattle(battle: Omit<Battle, 'id' | 'createdAt' | 'status' | 'votesA' | 'votesB' | 'memeOneId' | 'memeTwoId'>): Promise<Battle | null> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .insert({
        prompt: battle.prompt,
        prompt_id: battle.promptId,
        creator_id: battle.creator_id,
        start_time: battle.startTime?.toISOString(),
        end_time: battle.endTime?.toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting battle:', error);
      return null;
    }

    if (!data) {
      console.log('Failed to insert battle');
      return null;
    }

    return mapBattle(data);
  } catch (error) {
    console.error('Unexpected error inserting battle:', error);
    return null;
  }
}

/**
 * Update a battle
 * @param battleId 
 * @param battle 
 */
export async function updateBattle(battleId: string, battle: Partial<Battle>): Promise<Battle | null> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .update({
        prompt: battle.prompt,
        prompt_id: battle.promptId,
        creator_id: battle.creator_id,
        start_time: battle.startTime?.toISOString(),
        end_time: battle.endTime?.toISOString(),
        status: battle.status,
        votes_a: battle.votes_a,
        votes_b: battle.votes_b,
        meme_one_id: battle.meme_one_id,
        meme_two_id: battle.meme_two_id,
      })
      .eq('id', battleId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating battle:', error);
      return null;
    }

    if (!data) {
      console.log('Battle not found with id:', battleId);
      return null;
    }

    return mapBattle(data);
  } catch (error) {
    console.error('Unexpected error updating battle:', error);
    return null;
  }
}

/**
 * Delete a battle
 * @param battleId 
 */
export async function deleteBattle(battleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('battles')
      .delete()
      .eq('id', battleId);

    if (error) {
      console.error('Error deleting battle:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting battle:', error);
    return false;
  }
}

// Map database fields to frontend model fields
function mapBattle(data: any): Battle {
  return {
    id: data.id,
    prompt: data.prompt || '',
    promptId: data.prompt_id || null,
    creator_id: data.creator_id || '',
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    status: data.status || 'active',
    votes_a: data.votes_a || 0,
    votes_b: data.votes_b || 0,
    meme_one_id: data.meme_one_id || null,
    meme_two_id: data.meme_two_id || null,
    createdAt: new Date(data.created_at),
    voteCount: data.vote_count || 0,
    memeOneId: data.meme_one_id,
    memeTwoId: data.meme_two_id,
    winnerId: data.winner_id,
    is_community: data.is_community,
  };
}

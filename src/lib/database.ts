
import { supabase } from '@/integrations/supabase/client';
import { Caption, Meme, Prompt, Battle, User } from './types';
import { Database } from '@/integrations/supabase/types';

/**
 * This file handles database operations through the Supabase client.
 * We use simple type mappings to avoid TypeScript circular reference errors.
 */

// Raw database row types matching the database schema exactly
interface RawPromptRow {
  id: string;
  text: string;
  theme: string | null;
  tags: string[];
  active: boolean;
  start_date: string;
  end_date: string;
  description: string | null;
  creator_id: string | null;
  is_community: boolean;
}

interface RawMemeRow {
  id: string;
  prompt: string | null;
  prompt_id: string | null;
  image_url: string;
  ipfs_cid: string | null;
  caption: string;
  creator_id: string;
  votes: number;
  created_at: string;
  tags: string[];
  battle_id: string | null;
  is_battle_submission: boolean;
}

interface RawBattleRow {
  id: string;
  prompt_id: string | null;
  meme_one_id: string;
  meme_two_id: string;
  winner_id: string | null;
  vote_count: number;
  start_time: string;
  end_time: string;
  status: string;
  creator_id: string | null;
  is_community: boolean;
}

interface RawProfileRow {
  id: string;
  username: string;
  avatar_url: string | null;
  meme_streak: number;
  wins: number;
  losses: number;
  level: number;
  xp: number;
  created_at: string;
}

// Helper functions to convert database rows to application models
const mapPromptRowToPrompt = (row: RawPromptRow): Prompt => ({
  id: row.id,
  text: row.text,
  theme: row.theme || '',
  tags: row.tags || [],
  active: row.active,
  startDate: new Date(row.start_date),
  endDate: new Date(row.end_date),
  description: row.description || undefined,
  creator_id: row.creator_id || undefined,
  is_community: row.is_community
});

const mapMemeRowToMeme = (row: RawMemeRow): Meme => ({
  id: row.id,
  prompt: row.prompt || '',
  prompt_id: row.prompt_id || undefined,
  imageUrl: row.image_url,
  ipfsCid: row.ipfs_cid || '',
  caption: row.caption,
  creatorId: row.creator_id,
  votes: row.votes,
  createdAt: new Date(row.created_at),
  tags: row.tags || [],
  isBattleSubmission: row.is_battle_submission || false,
  battleId: row.battle_id || undefined
});

const mapProfileRowToUser = (row: RawProfileRow): User => ({
  id: row.id,
  username: row.username,
  avatarUrl: row.avatar_url || '',
  memeStreak: row.meme_streak,
  wins: row.wins,
  losses: row.losses,
  level: row.level,
  xp: row.xp,
  createdAt: new Date(row.created_at)
});

// Database functions

export const getActivePrompt = async (): Promise<Prompt | null> => {
  try {
    const today = new Date();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*') 
      .eq('active', true)
      .lte('start_date', today.toISOString())
      .gte('end_date', today.toISOString())
      .maybeSingle(); 
    
    if (error) {
      console.error('Error fetching active prompt:', error);
      return null;
    }

    if (!data) {
      console.log('No active prompt found in database');
      return null;
    }
    
    // Convert to our app model
    return mapPromptRowToPrompt(data);
  } catch (error) {
    console.error('Error in getActivePrompt:', error);
    return null;
  }
};

export const getPromptById = async (promptId: string): Promise<Prompt | null> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching prompt by ID:', error);
      return null;
    }
    
    if (!data) return null;
    
    return mapPromptRowToPrompt(data);
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
};

export const getProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (!data) return null;
    
    // Transform to application model
    return mapProfileRowToUser(data);
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, updates: any): Promise<User | null> => {
  try {
    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.memeStreak !== undefined) dbUpdates.meme_streak = updates.memeStreak;
    if (updates.wins !== undefined) dbUpdates.wins = updates.wins;
    if (updates.losses !== undefined) dbUpdates.losses = updates.losses;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select('*');

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    if (!data || data.length === 0) return null;
    
    // Return transformed data
    return mapProfileRowToUser(data[0]);
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
};

export const getMemesByUserId = async (userId: string): Promise<Meme[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memes by user ID:', error);
      return [];
    }

    if (!data || !data.length) return [];
    
    // Transform data items
    return data.map(mapMemeRowToMeme);
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
};

export const createProfile = async (profile: {
  id: string;
  username: string;
  avatarUrl?: string;
}): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatarUrl,
        meme_streak: 0,
        wins: 0,
        losses: 0,
        level: 1,
        xp: 0
      })
      .select('*');

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    if (!data || data.length === 0) return null;
    
    // Transform to application model
    return mapProfileRowToUser(data[0]);
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
};

export const getActiveBattles = async (limit: number = 20, offset: number = 0, filter: string = 'all'): Promise<Battle[]> => {
  try {
    // Build the query
    let query = supabase
      .from('battles')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: false });
    
    if (filter === 'community') {
      query = query.eq('is_community', true);
    } else if (filter === 'official') {
      query = query.eq('is_community', false);
    }
    
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data: battlesData, error } = await query;
    
    if (error) {
      console.error('Error fetching active battles:', error);
      return [];
    }
    
    if (!battlesData || battlesData.length === 0) {
      return [];
    }

    // Create an array to hold battles
    const battles: Battle[] = [];
    
    // Process each battle separately to avoid circular references
    for (const battle of battlesData) {
      // For memes, use separate queries to avoid deep type instantiation
      let memeOne: Meme | undefined;
      if (battle.meme_one_id) {
        const { data: memeData } = await supabase
          .from('memes')
          .select('*')
          .eq('id', battle.meme_one_id)
          .single();
          
        if (memeData) {
          memeOne = mapMemeRowToMeme(memeData);
        }
      }
      
      // Fetch meme two
      let memeTwo: Meme | undefined;
      if (battle.meme_two_id) {
        const { data: memeData } = await supabase
          .from('memes')
          .select('*')
          .eq('id', battle.meme_two_id)
          .single();
          
        if (memeData) {
          memeTwo = mapMemeRowToMeme(memeData);
        }
      }

      // Create battle object
      battles.push({
        id: battle.id,
        promptId: battle.prompt_id || '',
        memeOneId: battle.meme_one_id,
        memeTwoId: battle.meme_two_id,
        memeOne,
        memeTwo,
        winnerId: battle.winner_id || undefined,
        voteCount: battle.vote_count,
        startTime: new Date(battle.start_time),
        endTime: new Date(battle.end_time),
        status: battle.status as 'active' | 'completed' | 'cancelled',
        is_community: battle.is_community,
        creator_id: battle.creator_id || undefined
      });
    }

    return battles;
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
};

export const getBattleById = async (battleId: string): Promise<Battle | null> => {
  try {
    // Fetch the battle
    const { data: battle, error } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();
    
    if (error) {
      console.error('Error fetching battle:', error);
      return null;
    }
    
    if (!battle) {
      return null;
    }
    
    // Fetch meme one
    let memeOne: Meme | undefined;
    if (battle.meme_one_id) {
      const { data: memeData } = await supabase
        .from('memes')
        .select('*')
        .eq('id', battle.meme_one_id)
        .single();
        
      if (memeData) {
        memeOne = mapMemeRowToMeme(memeData);
      }
    }
    
    // Fetch meme two
    let memeTwo: Meme | undefined;
    if (battle.meme_two_id) {
      const { data: memeData } = await supabase
        .from('memes')
        .select('*')
        .eq('id', battle.meme_two_id)
        .single();
        
      if (memeData) {
        memeTwo = mapMemeRowToMeme(memeData);
      }
    }
    
    return {
      id: battle.id,
      promptId: battle.prompt_id || '',
      memeOneId: battle.meme_one_id,
      memeTwoId: battle.meme_two_id,
      memeOne,
      memeTwo,
      winnerId: battle.winner_id || undefined,
      voteCount: battle.vote_count,
      startTime: new Date(battle.start_time),
      endTime: new Date(battle.end_time),
      status: battle.status as 'active' | 'completed' | 'cancelled',
      is_community: battle.is_community,
      creator_id: battle.creator_id || undefined
    };
  } catch (error) {
    console.error('Error in getBattleById:', error);
    return null;
  }
};

export const getPrompts = async (limit: number = 10, offset: number = 0, isCommunity: boolean = false): Promise<Prompt[]> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('active', true)
      .eq('is_community', isCommunity)
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    if (!data || !data.length) return [];
    
    // Transform each item
    return data.map(mapPromptRowToPrompt);
  } catch (error) {
    console.error('Error in getPrompts:', error);
    return [];
  }
};

export const createMeme = async (meme: {
  prompt?: string;
  prompt_id?: string;
  imageUrl: string;
  ipfsCid?: string;
  caption: string;
  creatorId: string;
  votes: number;
  createdAt: Date;
  tags: string[];
}) => {
  console.log('Creating meme with data:', meme);

  try {
    // Convert to database format
    const dbMeme = {
      prompt: meme.prompt,
      prompt_id: meme.prompt_id,
      image_url: meme.imageUrl,
      ipfs_cid: meme.ipfsCid,
      caption: meme.caption,
      creator_id: meme.creatorId,
      votes: meme.votes,
      created_at: meme.createdAt.toISOString(),
      tags: meme.tags,
      is_battle_submission: false,
      battle_id: null
    };

    console.log('Sending to database:', dbMeme);

    const { data, error } = await supabase
      .from('memes')
      .insert(dbMeme)
      .select('*');

    if (error) {
      console.error('Error creating meme:', error);
      throw error;
    }

    console.log('Meme successfully saved to database:', data);
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from database after inserting meme');
    }
    
    // Transform to application model
    return mapMemeRowToMeme(data[0]);
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
};

export const createBattle = async (battle: {
  promptId?: string;
  memeOneId: string;
  memeTwoId: string;
  creatorId?: string;
  isCommunity: boolean;
  startTime?: Date;
  endTime?: Date;
}): Promise<Battle | null> => {
  try {
    const now = new Date();
    const endTime = battle.endTime || new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default: 24 hours from now
    
    const dbBattle = {
      prompt_id: battle.promptId,
      meme_one_id: battle.memeOneId,
      meme_two_id: battle.memeTwoId,
      creator_id: battle.creatorId,
      is_community: battle.isCommunity,
      start_time: (battle.startTime || now).toISOString(),
      end_time: endTime.toISOString(),
      status: 'active',
      vote_count: 0
    };
    
    const { data, error } = await supabase
      .from('battles')
      .insert(dbBattle)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating battle:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Update the memes to mark them as battle submissions
    await supabase
      .from('memes')
      .update({ 
        is_battle_submission: true,
        battle_id: data.id 
      })
      .in('id', [battle.memeOneId, battle.memeTwoId]);
    
    // Fetch the memes for the battle
    const memeOne = await getMemeById(battle.memeOneId);
    const memeTwo = await getMemeById(battle.memeTwoId);
    
    return {
      id: data.id,
      promptId: data.prompt_id || '',
      memeOneId: data.meme_one_id,
      memeTwoId: data.meme_two_id,
      memeOne,
      memeTwo,
      voteCount: data.vote_count,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      status: data.status as 'active' | 'completed' | 'cancelled',
      is_community: data.is_community,
      creator_id: data.creator_id || undefined
    };
  } catch (error) {
    console.error('Error in createBattle:', error);
    return null;
  }
};

export const getMemeById = async (memeId: string): Promise<Meme | null> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('id', memeId)
      .single();
      
    if (error) {
      console.error('Error fetching meme by ID:', error);
      return null;
    }
    
    if (!data) return null;
    
    return mapMemeRowToMeme(data);
  } catch (error) {
    console.error('Error in getMemeById:', error);
    return null;
  }
};

export const castVote = async (battleId: string, memeId: string, userId: string): Promise<boolean> => {
  try {
    // First check if user has already voted
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('battle_id', battleId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing vote:', checkError);
      return false;
    }
    
    if (existingVote) {
      console.log('User already voted in this battle');
      return false;
    }
    
    // Create the vote record
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        battle_id: battleId,
        meme_id: memeId,
        user_id: userId
      });
      
    if (voteError) {
      console.error('Error casting vote:', voteError);
      return false;
    }
    
    // Increment the vote count for the meme
    const { error: memeError } = await supabase.rpc('increment_meme_votes', {
      meme_id: memeId
    });
    
    if (memeError) {
      console.error('Error incrementing meme votes:', memeError);
    }
    
    // Increment the battle vote count
    const { error: battleError } = await supabase.rpc('increment_battle_votes', {
      battle_id: battleId
    });
    
    if (battleError) {
      console.error('Error incrementing battle votes:', battleError);
    }
    
    return true;
  } catch (error) {
    console.error('Error in castVote:', error);
    return false;
  }
};

export const createPrompt = async (prompt: {
  text: string;
  theme?: string;
  tags: string[];
  description?: string;
  isCommunity: boolean;
  creatorId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<Prompt | null> => {
  try {
    const now = new Date();
    const endDate = prompt.endDate || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default: 7 days from now
    
    const dbPrompt = {
      text: prompt.text,
      theme: prompt.theme || null,
      tags: prompt.tags,
      description: prompt.description || null,
      is_community: prompt.isCommunity,
      creator_id: prompt.creatorId || null,
      active: true,
      start_date: (prompt.startDate || now).toISOString(),
      end_date: endDate.toISOString()
    };
    
    const { data, error } = await supabase
      .from('prompts')
      .insert(dbPrompt)
      .select('*')
      .single();
      
    if (error) {
      console.error('Error creating prompt:', error);
      return null;
    }
    
    if (!data) return null;
    
    return mapPromptRowToPrompt(data);
  } catch (error) {
    console.error('Error in createPrompt:', error);
    return null;
  }
};

// Function to get trending memes
export const getTrendingMemes = async (limit: number = 10): Promise<Meme[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('votes', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching trending memes:', error);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    return data.map(mapMemeRowToMeme);
  } catch (error) {
    console.error('Error in getTrendingMemes:', error);
    return [];
  }
};

// Function to get newest memes
export const getNewestMemes = async (limit: number = 10): Promise<Meme[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching newest memes:', error);
      return [];
    }
    
    if (!data || data.length === 0) return [];
    
    return data.map(mapMemeRowToMeme);
  } catch (error) {
    console.error('Error in getNewestMemes:', error);
    return [];
  }
};

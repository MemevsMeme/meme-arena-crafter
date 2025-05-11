
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

export const getActivePrompt = async (): Promise<Prompt | null> => {
  try {
    const today = new Date();
    
    const { data, error } = await supabase
      .from('prompts')
      .select('*')  // Select all fields, including newly added ones
      .eq('active', true)
      .lte('start_date', today.toISOString())
      .gte('end_date', today.toISOString())
      .maybeSingle(); // Use maybeSingle() instead of single() to avoid errors when no row is found
    
    if (error) {
      console.error('Error fetching active prompt:', error);
      return null;
    }

    if (!data) {
      console.log('No active prompt found in database');
      return null;
    }
    
    // Convert to our app model
    return {
      id: data.id,
      text: data.text,
      theme: data.theme || '',
      tags: data.tags || [],
      active: data.active,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      description: data.description || undefined,
      creator_id: data.creator_id || undefined,
      is_community: data.is_community
    };
  } catch (error) {
    console.error('Error in getActivePrompt:', error);
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
    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak,
      wins: data.wins,
      losses: data.losses,
      level: data.level,
      xp: data.xp,
      createdAt: new Date(data.created_at)
    };
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
    return {
      id: data[0].id,
      username: data[0].username,
      avatarUrl: data[0].avatar_url || '',
      memeStreak: data[0].meme_streak,
      wins: data[0].wins,
      losses: data[0].losses,
      level: data[0].level,
      xp: data[0].xp,
      createdAt: new Date(data[0].created_at)
    };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
};

export const getMemesByUserId = async (userId: string): Promise<Meme[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')  // Select all columns including new ones
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memes by user ID:', error);
      return [];
    }

    if (!data || !data.length) return [];
    
    // Transform data items
    return data.map(item => ({
      id: item.id,
      prompt: item.prompt || '',
      prompt_id: item.prompt_id || undefined,
      imageUrl: item.image_url,
      ipfsCid: item.ipfs_cid || '',
      caption: item.caption,
      creatorId: item.creator_id,
      votes: item.votes,
      createdAt: new Date(item.created_at),
      tags: item.tags || [],
      isBattleSubmission: item.is_battle_submission || false,
      battleId: item.battle_id || undefined
    }));
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
    return {
      id: data[0].id,
      username: data[0].username,
      avatarUrl: data[0].avatar_url || '',
      memeStreak: data[0].meme_streak,
      wins: data[0].wins,
      losses: data[0].losses,
      level: data[0].level,
      xp: data[0].xp,
      createdAt: new Date(data[0].created_at)
    };
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
      .select('*')  // Select all fields including new ones
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
          memeOne = {
            id: memeData.id,
            prompt: memeData.prompt || '',
            prompt_id: memeData.prompt_id || undefined,
            imageUrl: memeData.image_url,
            ipfsCid: memeData.ipfs_cid || '',
            caption: memeData.caption,
            creatorId: memeData.creator_id,
            votes: memeData.votes,
            createdAt: new Date(memeData.created_at),
            tags: memeData.tags || [],
            isBattleSubmission: memeData.is_battle_submission || false,
            battleId: memeData.battle_id || undefined
          };
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
          memeTwo = {
            id: memeData.id,
            prompt: memeData.prompt || '',
            prompt_id: memeData.prompt_id || undefined,
            imageUrl: memeData.image_url,
            ipfsCid: memeData.ipfs_cid || '',
            caption: memeData.caption,
            creatorId: memeData.creator_id,
            votes: memeData.votes,
            createdAt: new Date(memeData.created_at),
            tags: memeData.tags || [],
            isBattleSubmission: memeData.is_battle_submission || false,
            battleId: memeData.battle_id || undefined
          };
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

export const getPrompts = async (limit: number = 10, offset: number = 0, isCommunity: boolean = false): Promise<Prompt[]> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')  // Select all columns including new ones
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
    return data.map(prompt => ({
      id: prompt.id,
      text: prompt.text,
      theme: prompt.theme || '',
      tags: prompt.tags || [],
      active: prompt.active,
      startDate: new Date(prompt.start_date),
      endDate: new Date(prompt.end_date),
      description: prompt.description || undefined,
      creator_id: prompt.creator_id || undefined,
      is_community: prompt.is_community
    }));
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
      .select('*');  // Select all fields

    if (error) {
      console.error('Error creating meme:', error);
      throw error;
    }

    console.log('Meme successfully saved to database:', data);
    
    if (!data || data.length === 0) {
      throw new Error('No data returned from database after inserting meme');
    }
    
    // Transform to application model
    return {
      id: data[0].id,
      prompt: data[0].prompt || '',
      prompt_id: data[0].prompt_id || undefined,
      imageUrl: data[0].image_url,
      ipfsCid: data[0].ipfs_cid || '',
      caption: data[0].caption,
      creatorId: data[0].creator_id,
      votes: data[0].votes,
      createdAt: new Date(data[0].created_at),
      tags: data[0].tags || [],
      isBattleSubmission: data[0].is_battle_submission || false,
      battleId: data[0].battle_id || undefined
    };
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
};

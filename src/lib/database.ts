
import { supabase } from '@/integrations/supabase/client';
import { Caption, Meme, Prompt, Battle, User } from './types';

/**
 * This file handles database operations through the Supabase client.
 * We use simple type mappings to avoid TypeScript circular reference errors.
 */

// Raw database row types to avoid recursive type issues
type RawPromptRow = {
  id: string;
  text: string;
  theme: string | null;
  tags: string[];
  active: boolean;
  start_date: string;
  end_date: string;
  description?: string | null;
  creator_id?: string | null;
  is_community?: boolean | null;
};

type RawMemeRow = {
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
  battle_id?: string | null;
  is_battle_submission?: boolean | null;
};

type RawBattleRow = {
  id: string;
  prompt_id: string | null;
  meme_one_id: string;
  meme_two_id: string;
  winner_id: string | null;
  vote_count: number;
  start_time: string;
  end_time: string;
  status: string;
  creator_id?: string | null;
  is_community?: boolean | null;
};

type RawProfileRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  meme_streak: number;
  wins: number;
  losses: number;
  level: number;
  xp: number;
  created_at: string;
};

export const getActivePrompt = async (): Promise<Prompt | null> => {
  try {
    const today = new Date();
    
    const { data, error } = await supabase
      .from('prompts')
      .select()
      .eq('active', true)
      .lte('start_date', today.toISOString())
      .gte('end_date', today.toISOString())
      .single();

    if (error) {
      console.error('Error fetching active prompt:', error);
      throw error;
    }

    // Return null if no data found
    if (!data) return null;
    
    // Directly use raw data without complex type casting
    const row = data as RawPromptRow;
    
    return {
      id: row.id,
      text: row.text,
      theme: row.theme || '',
      tags: row.tags || [],
      active: row.active,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      description: row.description || undefined,
      creator_id: row.creator_id || undefined,
      is_community: row.is_community === true
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
      .select()
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    if (!data) return null;
    
    // Use simple casting to raw type
    const profile = data as RawProfileRow;
    
    return {
      id: profile.id,
      username: profile.username,
      avatarUrl: profile.avatar_url || '',
      memeStreak: profile.meme_streak,
      wins: profile.wins,
      losses: profile.losses,
      level: profile.level,
      xp: profile.xp,
      createdAt: new Date(profile.created_at)
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
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    if (!data) return null;
    
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
    console.error('Error in updateProfile:', error);
    return null;
  }
};

export const getMemesByUserId = async (userId: string): Promise<Meme[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select()
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memes by user ID:', error);
      throw error;
    }

    if (!data || !data.length) return [];
    
    // Transform array data with explicit type
    return data.map(item => {
      const meme = item as RawMemeRow;
      return {
        id: meme.id,
        prompt: meme.prompt || '',
        prompt_id: meme.prompt_id || undefined,
        imageUrl: meme.image_url,
        ipfsCid: meme.ipfs_cid || '',
        caption: meme.caption,
        creatorId: meme.creator_id,
        votes: meme.votes,
        createdAt: new Date(meme.created_at),
        tags: meme.tags || [],
        isBattleSubmission: meme.is_battle_submission === true,
        battleId: meme.battle_id || undefined
      };
    });
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
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    if (!data) return null;
    
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
    console.error('Error in createProfile:', error);
    return null;
  }
};

export const getActiveBattles = async (limit: number = 20, offset: number = 0, filter: string = 'all'): Promise<Battle[]> => {
  try {
    // First, get battles without JOIN to avoid type recursion issues
    let battleQuery = supabase
      .from('battles')
      .select()
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (filter === 'community') {
      battleQuery = battleQuery.eq('is_community', true);
    } else if (filter === 'official') {
      battleQuery = battleQuery.eq('is_community', false);
    }

    const { data: battlesData, error: battlesError } = await battleQuery;

    if (battlesError) {
      console.error('Error fetching active battles:', battlesError);
      throw battlesError;
    }
    
    if (!battlesData || battlesData.length === 0) {
      return [];
    }

    const transformedBattles: Battle[] = [];
    
    // Process each battle separately to avoid deep instantiation
    for (const battle of battlesData) {
      // Explicitly type battle data
      const battleRow = battle as RawBattleRow;
      
      // Get meme one if it exists
      let memeOne: Meme | undefined;
      if (battleRow.meme_one_id) {
        const { data: memeOneData } = await supabase
          .from('memes')
          .select()
          .eq('id', battleRow.meme_one_id)
          .single();
        
        if (memeOneData) {
          const memeRow = memeOneData as RawMemeRow;
          
          memeOne = {
            id: memeRow.id,
            prompt: memeRow.prompt || '',
            prompt_id: memeRow.prompt_id || undefined,
            imageUrl: memeRow.image_url,
            ipfsCid: memeRow.ipfs_cid || '',
            caption: memeRow.caption,
            creatorId: memeRow.creator_id,
            votes: memeRow.votes,
            createdAt: new Date(memeRow.created_at),
            tags: memeRow.tags || [],
            isBattleSubmission: memeRow.is_battle_submission === true,
            battleId: memeRow.battle_id || undefined
          };
        }
      }
      
      // Get meme two if it exists
      let memeTwo: Meme | undefined;
      if (battleRow.meme_two_id) {
        const { data: memeTwoData } = await supabase
          .from('memes')
          .select()
          .eq('id', battleRow.meme_two_id)
          .single();
        
        if (memeTwoData) {
          const memeRow = memeTwoData as RawMemeRow;
          
          memeTwo = {
            id: memeRow.id,
            prompt: memeRow.prompt || '',
            prompt_id: memeRow.prompt_id || undefined,
            imageUrl: memeRow.image_url,
            ipfsCid: memeRow.ipfs_cid || '',
            caption: memeRow.caption,
            creatorId: memeRow.creator_id,
            votes: memeRow.votes,
            createdAt: new Date(memeRow.created_at),
            tags: memeRow.tags || [],
            isBattleSubmission: memeRow.is_battle_submission === true,
            battleId: memeRow.battle_id || undefined
          };
        }
      }

      // Transform battle with explicit boolean casting
      transformedBattles.push({
        id: battleRow.id,
        promptId: battleRow.prompt_id || '',
        memeOneId: battleRow.meme_one_id,
        memeTwoId: battleRow.meme_two_id,
        memeOne,
        memeTwo,
        winnerId: battleRow.winner_id || undefined,
        voteCount: battleRow.vote_count,
        startTime: new Date(battleRow.start_time),
        endTime: new Date(battleRow.end_time),
        status: battleRow.status as 'active' | 'completed' | 'cancelled',
        is_community: battleRow.is_community === true,
        creator_id: battleRow.creator_id || undefined
      });
    }

    return transformedBattles;
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
};

export const getPrompts = async (limit: number = 10, offset: number = 0, isCommunity: boolean = false): Promise<Prompt[]> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select()
      .eq('active', true)
      .eq('is_community', isCommunity)
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }

    if (!data || !data.length) return [];
    
    // Transform with explicit typing
    return data.map(item => {
      const promptRow = item as RawPromptRow;
      
      return {
        id: promptRow.id,
        text: promptRow.text,
        theme: promptRow.theme || '',
        tags: promptRow.tags || [],
        active: promptRow.active,
        startDate: new Date(promptRow.start_date),
        endDate: new Date(promptRow.end_date),
        description: promptRow.description || undefined,
        creator_id: promptRow.creator_id || undefined,
        is_community: promptRow.is_community === true
      };
    });
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
      .select()
      .single();

    if (error) {
      console.error('Error creating meme:', error);
      throw error;
    }

    console.log('Meme successfully saved to database:', data);
    
    if (!data) {
      throw new Error('No data returned from database after inserting meme');
    }
    
    const memeRow = data as RawMemeRow;
    
    // Return formatted meme object
    return {
      id: memeRow.id,
      prompt: memeRow.prompt || '',
      prompt_id: memeRow.prompt_id || undefined,
      imageUrl: memeRow.image_url,
      ipfsCid: memeRow.ipfs_cid || '',
      caption: memeRow.caption,
      creatorId: memeRow.creator_id,
      votes: memeRow.votes,
      createdAt: new Date(memeRow.created_at),
      tags: memeRow.tags || [],
      isBattleSubmission: memeRow.is_battle_submission === true,
      battleId: memeRow.battle_id || undefined
    };
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
};

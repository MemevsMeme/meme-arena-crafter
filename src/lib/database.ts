
import { supabase } from '@/integrations/supabase/client';
import { Caption, Meme, Prompt, Battle, User } from './types';

/**
 * This file handles database operations through the Supabase client.
 * We use simple type mappings to avoid TypeScript circular reference errors.
 */

// Raw database row types to match exactly what's in the database
type RawPromptRow = {
  id: string;
  text: string;
  theme: string | null;
  tags: string[];
  active: boolean;
  start_date: string;
  end_date: string;
  description: string | null;
  creator_id: string | null;
  is_community: boolean | null;
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
  battle_id: string | null;
  is_battle_submission: boolean | null;
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
  creator_id: string | null;
  is_community: boolean | null;
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
    
    // Use explicit select and avoid type inference
    const result = await supabase
      .from('prompts')
      .select('*')
      .eq('active', true)
      .lte('start_date', today.toISOString())
      .gte('end_date', today.toISOString())
      .single();
    
    if (result.error) {
      console.error('Error fetching active prompt:', result.error);
      return null;
    }

    if (!result.data) return null;
    
    // Cast to a simple object to break type recursion
    const row = result.data as {
      id: string;
      text: string;
      theme: string | null;
      tags: string[];
      active: boolean;
      start_date: string;
      end_date: string;
      description: string | null;
      creator_id: string | null;
      is_community: boolean | null;
    };
    
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
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (result.error) {
      console.error('Error fetching profile:', result.error);
      return null;
    }

    if (!result.data) return null;
    
    // Break type recursion by using a simple object
    const profile = result.data as {
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

    const result = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select('*');

    if (result.error) {
      console.error('Error updating profile:', result.error);
      return null;
    }

    if (!result.data || result.data.length === 0) return null;
    
    const data = result.data[0];
    
    // Return transformed profile with complete disconnect from DB types
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
    const result = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (result.error) {
      console.error('Error fetching memes by user ID:', result.error);
      return [];
    }

    if (!result.data || !result.data.length) return [];
    
    // Create array to store transformed memes
    const memes: Meme[] = [];
    
    // Process each meme individually to avoid type recursion
    for (const item of result.data) {
      memes.push({
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
        isBattleSubmission: item.is_battle_submission === true,
        battleId: item.battle_id || undefined
      });
    }
    
    return memes;
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
    const result = await supabase
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

    if (result.error) {
      console.error('Error creating profile:', result.error);
      return null;
    }

    if (!result.data || result.data.length === 0) return null;
    
    const data = result.data[0];
    
    // Clean return type with no dependency on Supabase types
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
    // Create a query builder to avoid TypeScript type issues
    let query = supabase
      .from('battles')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (filter === 'community') {
      query = query.eq('is_community', true);
    } else if (filter === 'official') {
      query = query.eq('is_community', false);
    }
    
    // Execute query
    const result = await query;
    
    if (result.error) {
      console.error('Error fetching active battles:', result.error);
      return [];
    }
    
    const battlesData = result.data || [];
    
    if (battlesData.length === 0) {
      return [];
    }

    // Create an array to hold the transformed battles
    const transformedBattles: Battle[] = [];
    
    // Process each battle individually
    for (const rawBattle of battlesData) {
      // Create battle object
      const battleRow: RawBattleRow = {
        id: rawBattle.id,
        prompt_id: rawBattle.prompt_id,
        meme_one_id: rawBattle.meme_one_id,
        meme_two_id: rawBattle.meme_two_id,
        winner_id: rawBattle.winner_id,
        vote_count: rawBattle.vote_count,
        start_time: rawBattle.start_time,
        end_time: rawBattle.end_time,
        status: rawBattle.status,
        creator_id: rawBattle.creator_id,
        is_community: rawBattle.is_community
      };
      
      // Process meme one
      let memeOne: Meme | undefined;
      if (battleRow.meme_one_id) {
        const memeResult = await supabase
          .from('memes')
          .select('*')
          .eq('id', battleRow.meme_one_id)
          .single();
          
        if (!memeResult.error && memeResult.data) {
          const memeData = memeResult.data;
          
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
            isBattleSubmission: memeData.is_battle_submission === true,
            battleId: memeData.battle_id || undefined
          };
        }
      }
      
      // Process meme two
      let memeTwo: Meme | undefined;
      if (battleRow.meme_two_id) {
        const memeResult = await supabase
          .from('memes')
          .select('*')
          .eq('id', battleRow.meme_two_id)
          .single();
          
        if (!memeResult.error && memeResult.data) {
          const memeData = memeResult.data;
          
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
            isBattleSubmission: memeData.is_battle_submission === true,
            battleId: memeData.battle_id || undefined
          };
        }
      }

      // Create a battle object with explicit property assignments
      const battle: Battle = {
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
      };
      
      // Add the battle to our array
      transformedBattles.push(battle);
    }

    return transformedBattles;
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
};

export const getPrompts = async (limit: number = 10, offset: number = 0, isCommunity: boolean = false): Promise<Prompt[]> => {
  try {
    // Use explicit select to prevent TypeScript issues
    const result = await supabase
      .from('prompts')
      .select('*')
      .eq('active', true)
      .eq('is_community', isCommunity)
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (result.error) {
      console.error('Error fetching prompts:', result.error);
      return [];
    }

    if (!result.data || !result.data.length) return [];
    
    // Create an empty array with explicit Prompt[] type
    const prompts: Prompt[] = [];
    
    // Process each item individually to avoid type recursion
    for (const item of result.data) {
      prompts.push({
        id: item.id,
        text: item.text,
        theme: item.theme || '',
        tags: item.tags || [],
        active: item.active,
        startDate: new Date(item.start_date),
        endDate: new Date(item.end_date),
        description: item.description || undefined,
        creator_id: item.creator_id || undefined,
        is_community: item.is_community === true
      });
    }
    
    return prompts;
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

    const result = await supabase
      .from('memes')
      .insert(dbMeme)
      .select('*');

    if (result.error) {
      console.error('Error creating meme:', result.error);
      throw result.error;
    }

    console.log('Meme successfully saved to database:', result.data);
    
    if (!result.data || result.data.length === 0) {
      throw new Error('No data returned from database after inserting meme');
    }
    
    const data = result.data[0];
    
    // Use explicitly typed object to break circular references
    return {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id || undefined,
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      votes: data.votes,
      createdAt: new Date(data.created_at),
      tags: data.tags || [],
      isBattleSubmission: data.is_battle_submission === true,
      battleId: data.battle_id || undefined
    };
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Caption, Meme, Prompt, Battle, User } from './types';

export const getActivePrompt = async (): Promise<Prompt | null> => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('date', formattedDate)
      .single();

    if (error) {
      console.error('Error fetching active prompt:', error);
      throw error;
    }

    // Transform data to match Prompt interface
    return data ? {
      id: data.id,
      text: data.text,
      theme: data.theme || '',
      tags: data.tags || [],
      active: data.active,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      description: data.description || undefined,
      creator_id: data.creator_id || undefined,
      is_community: data.is_community || false
    } : null;
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
      throw error;
    }

    // Transform data to match User interface
    return data ? {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak,
      wins: data.wins,
      losses: data.losses,
      level: data.level,
      xp: data.xp,
      createdAt: new Date(data.created_at)
    } : null;
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

    // Transform data to match User interface
    return data ? {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak,
      wins: data.wins,
      losses: data.losses,
      level: data.level,
      xp: data.xp,
      createdAt: new Date(data.created_at)
    } : null;
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
      throw error;
    }

    // Transform data to match Meme interface
    return data ? data.map(meme => ({
      id: meme.id,
      prompt: meme.prompt || '',
      prompt_id: meme.prompt_id,
      imageUrl: meme.image_url,
      ipfsCid: meme.ipfs_cid || '',
      caption: meme.caption,
      creatorId: meme.creator_id,
      votes: meme.votes,
      createdAt: new Date(meme.created_at),
      tags: meme.tags || [],
      isBattleSubmission: meme.is_battle_submission || false,
      battleId: meme.battle_id
    })) : [];
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

    // Transform data to match User interface
    return data ? {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak,
      wins: data.wins,
      losses: data.losses,
      level: data.level,
      xp: data.xp,
      createdAt: new Date(data.created_at)
    } : null;
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
};

export const getActiveBattles = async (limit: number = 20, offset: number = 0, filter: string = 'all'): Promise<Battle[]> => {
  try {
    let query = supabase
      .from('battles')
      .select('*, meme_one:meme_one_id(*), meme_two:meme_two_id(*)')
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (filter === 'community') {
      query = query.eq('is_community', true);
    } else if (filter === 'official') {
      query = query.eq('is_community', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active battles:', error);
      throw error;
    }

    // Transform data to match Battle interface
    return data ? data.map(battle => ({
      id: battle.id,
      promptId: battle.prompt_id || '',
      memeOneId: battle.meme_one_id,
      memeTwoId: battle.meme_two_id,
      memeOne: battle.meme_one ? {
        id: battle.meme_one.id,
        prompt: battle.meme_one.prompt || '',
        prompt_id: battle.meme_one.prompt_id,
        imageUrl: battle.meme_one.image_url,
        ipfsCid: battle.meme_one.ipfs_cid || '',
        caption: battle.meme_one.caption,
        creatorId: battle.meme_one.creator_id,
        votes: battle.meme_one.votes,
        createdAt: new Date(battle.meme_one.created_at),
        tags: battle.meme_one.tags || []
      } : undefined,
      memeTwo: battle.meme_two ? {
        id: battle.meme_two.id,
        prompt: battle.meme_two.prompt || '',
        prompt_id: battle.meme_two.prompt_id,
        imageUrl: battle.meme_two.image_url,
        ipfsCid: battle.meme_two.ipfs_cid || '',
        caption: battle.meme_two.caption,
        creatorId: battle.meme_two.creator_id,
        votes: battle.meme_two.votes,
        createdAt: new Date(battle.meme_two.created_at),
        tags: battle.meme_two.tags || []
      } : undefined,
      winnerId: battle.winner_id,
      voteCount: battle.vote_count,
      startTime: new Date(battle.start_time),
      endTime: new Date(battle.end_time),
      status: battle.status as 'active' | 'completed' | 'cancelled',
      is_community: battle.is_community,
      creator_id: battle.creator_id
    })) : [];
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
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
      throw error;
    }

    // Transform data to match Prompt interface
    return data ? data.map(prompt => ({
      id: prompt.id,
      text: prompt.text,
      theme: prompt.theme || '',
      tags: prompt.tags || [],
      active: prompt.active,
      startDate: new Date(prompt.start_date),
      endDate: new Date(prompt.end_date),
      description: prompt.description || undefined,
      creator_id: prompt.creator_id,
      is_community: prompt.is_community
    })) : [];
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
    // Convert the meme object to a database-friendly format
    const dbMeme = {
      prompt: meme.prompt,
      prompt_id: meme.prompt_id,
      image_url: meme.imageUrl, // Note the snake_case here
      ipfs_cid: meme.ipfsCid,
      caption: meme.caption,
      creator_id: meme.creatorId,
      votes: meme.votes,
      created_at: meme.createdAt.toISOString(),
      tags: meme.tags,
      // Add these default values to prevent database errors
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
    
    // Transform the database response to match the expected format with camelCase properties
    const transformedData = {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id,
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      votes: data.votes,
      createdAt: new Date(data.created_at),
      tags: data.tags || [],
      isBattleSubmission: data.is_battle_submission || false,
      battleId: data.battle_id
    };
    
    return transformedData;
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
};

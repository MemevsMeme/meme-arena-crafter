import { supabase } from '@/integrations/supabase/client';
import { Caption, Meme, Prompt, Battle, User } from './types';

// Simple type definitions to avoid deep recursion
// Instead of using the full Database types which may cause circular references
type SimplePromptRow = {
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

type SimpleMemeRow = {
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

type SimpleBattleRow = {
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

type SimpleProfileRow = {
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
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    // Use our simplified type instead of the deep Database type
    const { data, error } = await supabase
      .from('prompts')
      .select()
      .eq('date', formattedDate)
      .single();

    if (error) {
      console.error('Error fetching active prompt:', error);
      throw error;
    }

    // Transform data to match Prompt interface with explicit null/undefined checks
    if (!data) return null;
    
    // Use our simplified type for more straightforward handling
    const row = data as unknown as SimplePromptRow;
    
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
      is_community: typeof row.is_community !== undefined ? Boolean(row.is_community) : false
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
    
    // Cast to our simplified type
    const profile = data as unknown as SimpleProfileRow;
    
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

    if (!data) return [];
    
    // Transform data to match Meme interface - safely handling potentially missing fields
    return data.map(meme => {
      // Cast to our simplified type
      const memeData = meme as unknown as SimpleMemeRow;
      
      return {
        id: memeData.id,
        prompt: memeData.prompt || '',
        prompt_id: memeData.prompt_id,
        imageUrl: memeData.image_url,
        ipfsCid: memeData.ipfs_cid || '',
        caption: memeData.caption,
        creatorId: memeData.creator_id,
        votes: memeData.votes,
        createdAt: new Date(memeData.created_at),
        tags: memeData.tags || [],
        // Explicitly handle fields that may not exist in older database records
        isBattleSubmission: typeof memeData.is_battle_submission !== undefined ? Boolean(memeData.is_battle_submission) : false,
        battleId: memeData.battle_id || undefined
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
      .select('id, prompt_id, meme_one_id, meme_two_id, winner_id, vote_count, start_time, end_time, status, creator_id, is_community')
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
    
    // No battles found
    if (!battlesData || battlesData.length === 0) {
      return [];
    }

    const transformedBattles: Battle[] = [];
    
    // Process each battle separately
    for (const battle of battlesData) {
      // Cast to our simplified type
      const battleData = battle as unknown as SimpleBattleRow;
      
      // Get meme one if it exists
      let memeOne: Meme | undefined;
      if (battleData.meme_one_id) {
        const { data: memeOneData } = await supabase
          .from('memes')
          .select()
          .eq('id', battleData.meme_one_id)
          .single();
        
        if (memeOneData) {
          // Cast to our simplified type
          const meme = memeOneData as unknown as SimpleMemeRow;
          
          // Transform memeOneData with safe handling of potentially missing fields
          memeOne = {
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
            isBattleSubmission: typeof meme.is_battle_submission !== 'undefined' 
              ? Boolean(meme.is_battle_submission) 
              : false,
            battleId: meme.battle_id || undefined
          };
        }
      }
      
      // Get meme two if it exists
      let memeTwo: Meme | undefined;
      if (battleData.meme_two_id) {
        const { data: memeTwoData } = await supabase
          .from('memes')
          .select()
          .eq('id', battleData.meme_two_id)
          .single();
        
        if (memeTwoData) {
          // Cast to our simplified type
          const meme = memeTwoData as unknown as SimpleMemeRow;
          
          memeTwo = {
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
            isBattleSubmission: typeof meme.is_battle_submission !== 'undefined' 
              ? Boolean(meme.is_battle_submission) 
              : false,
            battleId: meme.battle_id || undefined
          };
        }
      }

      // Use explicit String casting to handle potentially undefined values
      const winner_id = battleData.winner_id as string | undefined;
      
      // Transform battle data with safe type handling
      transformedBattles.push({
        id: battleData.id,
        promptId: battleData.prompt_id || '',
        memeOneId: battleData.meme_one_id,
        memeTwoId: battleData.meme_two_id,
        memeOne,
        memeTwo,
        winnerId: winner_id,
        voteCount: battleData.vote_count,
        startTime: new Date(battleData.start_time),
        endTime: new Date(battleData.end_time),
        status: battleData.status as 'active' | 'completed' | 'cancelled',
        is_community: typeof battleData.is_community !== 'undefined' ? Boolean(battleData.is_community) : false,
        creator_id: battleData.creator_id || undefined
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

    if (!data) return [];
    
    // Transform data safely with explicit checks for fields that may be missing
    return data.map(prompt => {
      // Cast to our simplified type
      const promptData = prompt as unknown as SimplePromptRow;
      
      return {
        id: promptData.id,
        text: promptData.text,
        theme: promptData.theme || '',
        tags: promptData.tags || [],
        active: promptData.active,
        startDate: new Date(promptData.start_date),
        endDate: new Date(promptData.end_date),
        description: promptData.description || undefined,
        creator_id: promptData.creator_id || undefined,
        is_community: typeof promptData.is_community !== 'undefined' ? Boolean(promptData.is_community) : false
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
    // Convert the meme object to a database-friendly format
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
    
    if (!data) {
      throw new Error('No data returned from database after inserting meme');
    }
    
    // Cast to our simplified type
    const memeData = data as unknown as SimpleMemeRow;
    
    // Transform the database response to match the expected format with camelCase properties
    return {
      id: memeData.id,
      prompt: memeData.prompt || '',
      prompt_id: memeData.prompt_id,
      imageUrl: memeData.image_url,
      ipfsCid: memeData.ipfs_cid || '',
      caption: memeData.caption,
      creatorId: memeData.creator_id,
      votes: memeData.votes,
      createdAt: new Date(memeData.created_at),
      tags: memeData.tags || [],
      isBattleSubmission: typeof memeData.is_battle_submission !== 'undefined' ? Boolean(memeData.is_battle_submission) : false,
      battleId: memeData.battle_id || undefined
    };
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
};


import { supabase } from '@/integrations/supabase/client';
import { Battle, Meme, Prompt, User } from './types';
import { BattleFilterType } from '@/components/battle/BattleFilter';

/**
 * Get user profile by user ID
 */
export const getProfile = async (userId: string) => {
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

    return mapDbProfileToProfile(data);
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
};

/**
 * Create user profile
 */
export const createProfile = async (profileData: { id: string, username: string, avatarUrl?: string }) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: profileData.id,
        username: profileData.username,
        avatar_url: profileData.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profileData.id}`,
        meme_streak: 0,
        wins: 0,
        losses: 0,
        level: 1,
        xp: 0
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    return mapDbProfileToProfile(data);
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, updates: any) => {
  try {
    // Convert camelCase to snake_case for database fields
    const dbUpdates = {};
    if (updates.avatarUrl) dbUpdates['avatar_url'] = updates.avatarUrl;
    if (updates.memeStreak !== undefined) dbUpdates['meme_streak'] = updates.memeStreak;
    if (updates.wins !== undefined) dbUpdates['wins'] = updates.wins;
    if (updates.losses !== undefined) dbUpdates['losses'] = updates.losses;
    if (updates.level !== undefined) dbUpdates['level'] = updates.level;
    if (updates.xp !== undefined) dbUpdates['xp'] = updates.xp;
    if (updates.username) dbUpdates['username'] = updates.username;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    // Convert response to camelCase for frontend
    return mapDbProfileToProfile(data);
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
};

/**
 * Map DB profile to camelCase profile
 */
const mapDbProfileToProfile = (dbProfile) => {
  if (!dbProfile) return null;
  
  return {
    id: dbProfile.id,
    username: dbProfile.username,
    avatarUrl: dbProfile.avatar_url,
    memeStreak: dbProfile.meme_streak,
    wins: dbProfile.wins,
    losses: dbProfile.losses,
    level: dbProfile.level,
    xp: dbProfile.xp,
    createdAt: dbProfile.created_at
  };
};

/**
 * Map DB meme to camelCase meme
 */
const mapDbMemeToMeme = (dbMeme): Meme => {
  if (!dbMeme) return null;
  
  return {
    id: dbMeme.id,
    prompt: dbMeme.prompt,
    prompt_id: dbMeme.prompt_id,
    imageUrl: dbMeme.image_url,
    ipfsCid: dbMeme.ipfs_cid,
    caption: dbMeme.caption,
    creatorId: dbMeme.creator_id,
    votes: dbMeme.votes,
    createdAt: dbMeme.created_at,
    tags: dbMeme.tags,
    isBattleSubmission: dbMeme.is_battle_submission,
    battleId: dbMeme.battle_id
  };
};

/**
 * Map DB battle to camelCase battle
 */
const mapDbBattleToBattle = (dbBattle): Battle => {
  if (!dbBattle) return null;
  
  return {
    id: dbBattle.id,
    promptId: dbBattle.prompt_id,
    memeOneId: dbBattle.meme_one_id,
    memeTwoId: dbBattle.meme_two_id,
    winnerId: dbBattle.winner_id,
    creator_id: dbBattle.creator_id,
    startTime: dbBattle.start_time,
    endTime: dbBattle.end_time,
    status: dbBattle.status,
    voteCount: dbBattle.vote_count,
    is_community: dbBattle.is_community,
    memeOne: null, // These will be populated separately
    memeTwo: null
  };
};

/**
 * Get all memes
 */
export const getAllMemes = async () => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    return data.map(mapDbMemeToMeme);
  } catch (error) {
    console.error('Error in getAllMemes:', error);
    return [];
  }
};

/**
 * Get meme by ID
 */
export const getMemeById = async (memeId: string) => {
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

    return mapDbMemeToMeme(data);
  } catch (error) {
    console.error('Error in getMemeById:', error);
    return null;
  }
};

/**
 * Get memes by user ID
 */
export const getMemesByUserId = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    return data.map(mapDbMemeToMeme);
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
};

/**
 * Create a new meme
 */
export const createMeme = async (meme) => {
  try {
    // Convert camelCase to snake_case for database fields
    const dbMeme = {
      prompt: meme.prompt,
      prompt_id: meme.promptId || meme.prompt_id,
      image_url: meme.imageUrl || meme.image_url,
      ipfs_cid: meme.ipfsCid || meme.ipfs_cid,
      caption: meme.caption,
      creator_id: meme.creatorId || meme.creator_id,
      votes: meme.votes || 0,
      created_at: meme.createdAt || new Date().toISOString(),
      tags: meme.tags || [],
      battle_id: meme.battleId || meme.battle_id,
      is_battle_submission: meme.isBattleSubmission || meme.is_battle_submission || false
    };

    const { data, error } = await supabase
      .from('memes')
      .insert([dbMeme])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating meme:', error);
      return null;
    }

    return mapDbMemeToMeme(data);
  } catch (error) {
    console.error('Error in createMeme:', error);
    return null;
  }
};

/**
 * Update meme votes
 */
export const updateMemeVotes = async (memeId: string, votes: number) => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .update({ votes })
      .eq('id', memeId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating meme votes:', error);
      return null;
    }

    return mapDbMemeToMeme(data);
  } catch (error) {
    console.error('Error in updateMemeVotes:', error);
    return null;
  }
};

/**
 * Delete a meme
 */
export const deleteMeme = async (memeId: string) => {
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
    console.error('Error in deleteMeme:', error);
    return false;
  }
};

/**
 * Get all prompts
 */
export const getAllPrompts = async () => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    return data.map(mapDbPromptToPrompt);
  } catch (error) {
    console.error('Error in getAllPrompts:', error);
    return [];
  }
};

/**
 * Get prompts - Filter by community or official
 */
export const getPrompts = async (limit: number = 10, offset: number = 0, isCommunity: boolean | null = null) => {
  try {
    let query = supabase
      .from('prompts')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Apply community filter if specified
    if (isCommunity !== null) {
      query = query.eq('is_community', isCommunity);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    return data.map(mapDbPromptToPrompt);
  } catch (error) {
    console.error('Error in getPrompts:', error);
    return [];
  }
};

/**
 * Map DB prompt to camelCase prompt
 */
const mapDbPromptToPrompt = (dbPrompt): Prompt => {
  if (!dbPrompt) return null;
  
  return {
    id: dbPrompt.id,
    text: dbPrompt.text,
    theme: dbPrompt.theme,
    tags: dbPrompt.tags,
    is_community: dbPrompt.is_community,
    creator_id: dbPrompt.creator_id,
    startDate: new Date(dbPrompt.start_date),
    endDate: new Date(dbPrompt.end_date),
    description: dbPrompt.description,
    active: dbPrompt.active
  };
};

/**
 * Get prompt by ID
 */
export const getPromptById = async (promptId: string) => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (error) {
      console.error('Error fetching prompt:', error);
      return null;
    }

    return mapDbPromptToPrompt(data);
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
};

/**
 * Get active prompt
 */
export const getActivePrompt = async () => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .lt('start_date', new Date().toISOString())
      .gt('end_date', new Date().toISOString())
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching active prompt:', error);
      return null;
    }

    return mapDbPromptToPrompt(data);
  } catch (error) {
    console.error('Error in getActivePrompt:', error);
    return null;
  }
};

/**
 * Create a new prompt
 */
export const createPrompt = async (prompt) => {
  try {
    // Convert camelCase to snake_case
    const dbPrompt = {
      text: prompt.text,
      theme: prompt.theme,
      tags: prompt.tags || [],
      active: prompt.active || false,
      start_date: prompt.startDate || new Date().toISOString(),
      end_date: prompt.endDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      description: prompt.description,
      creator_id: prompt.creatorId,
      is_community: prompt.isCommunity || false
    };

    const { data, error } = await supabase
      .from('prompts')
      .insert([dbPrompt])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      return null;
    }

    return mapDbPromptToPrompt(data);
  } catch (error) {
    console.error('Error in createPrompt:', error);
    return null;
  }
};

/**
 * Update prompt
 */
export const updatePrompt = async (promptId: string, updates: any) => {
  try {
    // Convert camelCase to snake_case
    const dbUpdates = {};
    if (updates.text !== undefined) dbUpdates['text'] = updates.text;
    if (updates.theme !== undefined) dbUpdates['theme'] = updates.theme;
    if (updates.tags !== undefined) dbUpdates['tags'] = updates.tags;
    if (updates.active !== undefined) dbUpdates['active'] = updates.active;
    if (updates.startDate !== undefined) dbUpdates['start_date'] = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates['end_date'] = updates.endDate;
    if (updates.description !== undefined) dbUpdates['description'] = updates.description;
    if (updates.creatorId !== undefined) dbUpdates['creator_id'] = updates.creatorId;
    if (updates.isCommunity !== undefined) dbUpdates['is_community'] = updates.isCommunity;

    const { data, error } = await supabase
      .from('prompts')
      .update(dbUpdates)
      .eq('id', promptId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating prompt:', error);
      return null;
    }

    return mapDbPromptToPrompt(data);
  } catch (error) {
    console.error('Error in updatePrompt:', error);
    return null;
  }
};

/**
 * Delete a prompt
 */
export const deletePrompt = async (promptId: string) => {
  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', promptId);

    if (error) {
      console.error('Error deleting prompt:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePrompt:', error);
    return false;
  }
};

/**
 * Get user vote 
 */
export const getUserVote = async (userId: string, memeId: string) => {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .eq('meme_id', memeId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user vote:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserVote:', error);
    return null;
  }
};

/**
 * Upvote a meme
 */
export const upvoteMeme = async (userId: string, memeId: string) => {
  try {
    // First, check if the user has already voted
    const existingVote = await getUserVote(userId, memeId);

    if (existingVote) {
      // If already voted, remove the vote
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('user_id', userId)
        .eq('meme_id', memeId);

      if (error) {
        console.error('Error removing vote:', error);
        return null;
      }

      return null;
    } else {
      // If the user has not voted, add a vote
      const { data, error } = await supabase
        .from('votes')
        .insert([{ user_id: userId, meme_id: memeId, battle_id: null }])
        .select('*')
        .single();

      if (error) {
        console.error('Error adding vote:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in upvoteMeme:', error);
    return null;
  }
};

/**
 * Get battle by ID - combine battle data with meme data
 */
export const getBattleById = async (battleId: string) => {
  try {
    // Get battle data
    const { data: battleData, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (battleError) {
      console.error('Error fetching battle:', battleError);
      return null;
    }

    if (!battleData) {
      return null;
    }

    // Get meme one
    const { data: memeOneData } = await supabase
      .from('memes')
      .select('*')
      .eq('id', battleData.meme_one_id)
      .single();

    // Get meme two
    const { data: memeTwoData } = await supabase
      .from('memes')
      .select('*')
      .eq('id', battleData.meme_two_id)
      .single();

    // Map to camelCase
    const battle = mapDbBattleToBattle(battleData);
    
    // Add memes to the battle object
    if (memeOneData) {
      battle.memeOne = mapDbMemeToMeme(memeOneData);
    }
    
    if (memeTwoData) {
      battle.memeTwo = mapDbMemeToMeme(memeTwoData);
    }

    return battle;
  } catch (error) {
    console.error('Error in getBattleById:', error);
    return null;
  }
};

/**
 * Cast a vote for a battle meme
 */
export const castVote = async (battleId: string, memeId: string, userId: string) => {
  try {
    // Check if the user has already voted in this battle
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id, meme_id')
      .eq('battle_id', battleId)
      .eq('user_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return { success: false, error: checkError };
    }

    // If there's an existing vote, update it
    if (existingVote) {
      // If voting for the same meme, do nothing
      if (existingVote.meme_id === memeId) {
        return { success: true, message: 'Vote already exists' };
      }
      
      // Otherwise, update the vote
      const { error: updateError } = await supabase
        .from('votes')
        .update({ meme_id: memeId })
        .eq('id', existingVote.id);

      if (updateError) {
        console.error('Error updating vote:', updateError);
        return { success: false, error: updateError };
      }
    } else {
      // If no existing vote, create a new one
      const { error: insertError } = await supabase
        .from('votes')
        .insert({
          user_id: userId,
          meme_id: memeId,
          battle_id: battleId
        });

      if (insertError) {
        console.error('Error creating vote:', insertError);
        return { success: false, error: insertError };
      }
    }

    // Update battle vote count
    const { data: votes, error: countError } = await supabase
      .from('votes')
      .select('id')
      .eq('battle_id', battleId);

    if (!countError) {
      await supabase
        .from('battles')
        .update({ vote_count: votes.length })
        .eq('id', battleId);
    }

    // Update meme votes
    await updateMemeBattleVotes(battleId);

    return { success: true };
  } catch (error) {
    console.error('Error in castVote:', error);
    return { success: false, error };
  }
};

/**
 * Update meme votes based on battle votes
 */
const updateMemeBattleVotes = async (battleId: string) => {
  try {
    const battle = await getBattleById(battleId);
    if (!battle) return;

    // Count votes for meme one
    const { data: memeOneVotes, error: memeOneError } = await supabase
      .from('votes')
      .select('id')
      .eq('battle_id', battleId)
      .eq('meme_id', battle.memeOneId);

    if (!memeOneError && battle.memeOne) {
      await supabase
        .from('memes')
        .update({ votes: memeOneVotes.length })
        .eq('id', battle.memeOneId);
    }

    // Count votes for meme two
    const { data: memeTwoVotes, error: memeTwoError } = await supabase
      .from('votes')
      .select('id')
      .eq('battle_id', battleId)
      .eq('meme_id', battle.memeTwoId);

    if (!memeTwoError && battle.memeTwo) {
      await supabase
        .from('memes')
        .update({ votes: memeTwoVotes.length })
        .eq('id', battle.memeTwoId);
    }
  } catch (error) {
    console.error('Error in updateMemeBattleVotes:', error);
  }
};

/**
 * Get active battles
 */
export const getActiveBattles = async (limit: number = 20, offset: number = 0, filter: BattleFilterType = 'all') => {
  try {
    let query = supabase
      .from('battles')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    // Apply filter if not 'all'
    if (filter === 'official') {
      query = query.eq('is_community', false);
    } else if (filter === 'community') {
      query = query.eq('is_community', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active battles:', error);
      return [];
    }

    return data.map(mapDbBattleToBattle);
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
};

/**
 * Get trending memes
 */
export const getTrendingMemes = async (limit: number = 10) => {
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

    return data.map(mapDbMemeToMeme);
  } catch (error) {
    console.error('Error in getTrendingMemes:', error);
    return [];
  }
};

/**
 * Get newest memes
 */
export const getNewestMemes = async (limit: number = 10) => {
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

    return data.map(mapDbMemeToMeme);
  } catch (error) {
    console.error('Error in getNewestMemes:', error);
    return [];
  }
};

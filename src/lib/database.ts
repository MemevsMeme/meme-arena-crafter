import { supabase } from '@/integrations/supabase/client';
import { Battle, Meme, Prompt } from './types';
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

    return data;
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

    return data;
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
const mapDbMemeToMeme = (dbMeme) => {
  if (!dbMeme) return null;
  
  return {
    id: dbMeme.id,
    prompt: dbMeme.prompt,
    promptId: dbMeme.prompt_id,
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
 * Get all meme comments
 */
export const getAllMemeComments = async (memeId: string) => {
  try {
    const { data, error } = await supabase
      .from('meme_comments')
      .select('*')
      .eq('memeId', memeId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching meme comments:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getAllMemeComments:', error);
    return [];
  }
};

/**
 * Create a new meme comment
 */
export const createMemeComment = async (comment) => {
  try {
    const { data, error } = await supabase
      .from('meme_comments')
      .insert([comment])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating meme comment:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createMemeComment:', error);
    return null;
  }
};

/**
 * Delete a meme comment
 */
export const deleteMemeComment = async (commentId: string) => {
  try {
    const { error } = await supabase
      .from('meme_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting meme comment:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMemeComment:', error);
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
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error in getAllPrompts:', error);
    return [];
  }
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

    return data;
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
      .lt('startDate', new Date().toISOString())
      .gt('endDate', new Date().toISOString())
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching active prompt:', error);
      return null;
    }

    return data;
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
    const { data, error } = await supabase
      .from('prompts')
      .insert([prompt])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      return null;
    }

    return data;
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
    const { data, error } = await supabase
      .from('prompts')
      .update(updates)
      .eq('id', promptId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating prompt:', error);
      return null;
    }

    return data;
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
 * Get user vote by user and meme ID
 */
export const getUserVote = async (userId: string, memeId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_votes')
      .select('*')
      .eq('userId', userId)
      .eq('memeId', memeId)
      .single();

    if (error) {
      // If no vote exists, it's not an error
      if (error.code === 'PGRST116') {
        return null;
      }
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
      // If the user has already upvoted, remove the vote
      if (existingVote.voteType === 'upvote') {
        const { error } = await supabase
          .from('user_votes')
          .delete()
          .eq('userId', userId)
          .eq('memeId', memeId);

        if (error) {
          console.error('Error removing upvote:', error);
          return null;
        }

        return null;
      } else {
        // If the user has downvoted, change the vote to upvote
        const { data, error } = await supabase
          .from('user_votes')
          .update({ voteType: 'upvote' })
          .eq('userId', userId)
          .eq('memeId', memeId)
          .select('*')
          .single();

        if (error) {
          console.error('Error changing vote to upvote:', error);
          return null;
        }

        return data;
      }
    } else {
      // If the user has not voted, add an upvote
      const { data, error } = await supabase
        .from('user_votes')
        .insert([{ userId, memeId, voteType: 'upvote' }])
        .select('*')
        .single();

      if (error) {
        console.error('Error adding upvote:', error);
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
 * Downvote a meme
 */
export const downvoteMeme = async (userId: string, memeId: string) => {
  try {
    // First, check if the user has already voted
    const existingVote = await getUserVote(userId, memeId);

    if (existingVote) {
      // If the user has already downvoted, remove the vote
      if (existingVote.voteType === 'downvote') {
        const { error } = await supabase
          .from('user_votes')
          .delete()
          .eq('userId', userId)
          .eq('memeId', memeId);

        if (error) {
          console.error('Error removing downvote:', error);
          return null;
        }

        return null;
      } else {
        // If the user has upvoted, change the vote to downvote
        const { data, error } = await supabase
          .from('user_votes')
          .update({ voteType: 'downvote' })
          .eq('userId', userId)
          .eq('memeId', memeId)
          .select('*')
          .single();

        if (error) {
          console.error('Error changing vote to downvote:', error);
          return null;
        }

        return data;
      }
    } else {
      // If the user has not voted, add a downvote
      const { data, error } = await supabase
        .from('user_votes')
        .insert([{ userId, memeId, voteType: 'downvote' }])
        .select('*')
        .single();

      if (error) {
        console.error('Error adding downvote:', error);
        return null;
      }

      return data;
    }
  } catch (error) {
    console.error('Error in downvoteMeme:', error);
    return null;
  }
};

/**
 * Get active battle prompts
 */
export const getActiveBattles = async (filter: BattleFilterType = 'all') => {
  try {
    let query = supabase
      .from('prompts')
      .select('*')
      .lt('start_date', new Date().toISOString())
      .gt('end_date', new Date().toISOString())
      .order('created_at', { ascending: false });

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

    return data;
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
};

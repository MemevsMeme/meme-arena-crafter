import { supabase } from '@/integrations/supabase/client';
import { Battle, Caption, Meme, MemeComment, Profile, Prompt, UserVote } from './types';
import { BattleFilterType } from '@/components/battle/BattleFilter';

/**
 * Get user profile by user ID
 */
export const getProfile = async (userId: string): Promise<Profile | null> => {
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

    return data as Profile;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
};

/**
 * Get all memes
 */
export const getAllMemes = async (): Promise<Meme[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    return data as Meme[];
  } catch (error) {
    console.error('Error in getAllMemes:', error);
    return [];
  }
};

/**
 * Get meme by ID
 */
export const getMemeById = async (memeId: string): Promise<Meme | null> => {
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

    return data as Meme;
  } catch (error) {
    console.error('Error in getMemeById:', error);
    return null;
  }
};

/**
 * Get memes by user ID
 */
export const getMemesByUserId = async (userId: string): Promise<Meme[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creatorId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }

    return data as Meme[];
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
};

/**
 * Create a new meme
 */
export const createMeme = async (meme: Omit<Meme, 'id'>): Promise<Meme | null> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .insert([meme])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating meme:', error);
      return null;
    }

    return data as Meme;
  } catch (error) {
    console.error('Error in createMeme:', error);
    return null;
  }
};

/**
 * Update meme votes
 */
export const updateMemeVotes = async (memeId: string, votes: number): Promise<Meme | null> => {
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

    return data as Meme;
  } catch (error) {
    console.error('Error in updateMemeVotes:', error);
    return null;
  }
};

/**
 * Delete a meme
 */
export const deleteMeme = async (memeId: string): Promise<boolean> => {
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
export const getAllMemeComments = async (memeId: string): Promise<MemeComment[]> => {
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

    return data as MemeComment[];
  } catch (error) {
    console.error('Error in getAllMemeComments:', error);
    return [];
  }
};

/**
 * Create a new meme comment
 */
export const createMemeComment = async (comment: Omit<MemeComment, 'id'>): Promise<MemeComment | null> => {
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

    return data as MemeComment;
  } catch (error) {
    console.error('Error in createMemeComment:', error);
    return null;
  }
};

/**
 * Delete a meme comment
 */
export const deleteMemeComment = async (commentId: string): Promise<boolean> => {
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
export const getAllPrompts = async (): Promise<Prompt[]> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    return data as Prompt[];
  } catch (error) {
    console.error('Error in getAllPrompts:', error);
    return [];
  }
};

/**
 * Get prompt by ID
 */
export const getPromptById = async (promptId: string): Promise<Prompt | null> => {
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

    return data as Prompt;
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
};

/**
 * Get active prompt
 */
export const getActivePrompt = async (): Promise<Prompt | null> => {
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

    return data as Prompt;
  } catch (error) {
    console.error('Error in getActivePrompt:', error);
    return null;
  }
};

/**
 * Get active battle prompts
 */
export const getActiveBattles = async (filter: BattleFilterType = 'all'): Promise<Battle[]> => {
  try {
    let query = supabase
      .from('prompts')
      .select('*')
      .lt('startDate', new Date().toISOString())
      .gt('endDate', new Date().toISOString())
      .order('createdAt', { ascending: false });

    // Apply filter if not 'all'
    if (filter === 'official') {
      query = query.eq('isCommunity', false);
    } else if (filter === 'community') {
      query = query.eq('isCommunity', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active battles:', error);
      return [];
    }

    return data as Battle[];
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
};

/**
 * Create a new prompt
 */
export const createPrompt = async (prompt: Omit<Prompt, 'id'>): Promise<Prompt | null> => {
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

    return data as Prompt;
  } catch (error) {
    console.error('Error in createPrompt:', error);
    return null;
  }
};

/**
 * Update prompt
 */
export const updatePrompt = async (promptId: string, updates: Partial<Prompt>): Promise<Prompt | null> => {
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

    return data as Prompt;
  } catch (error) {
    console.error('Error in updatePrompt:', error);
    return null;
  }
};

/**
 * Delete a prompt
 */
export const deletePrompt = async (promptId: string): Promise<boolean> => {
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
export const getUserVote = async (userId: string, memeId: string): Promise<UserVote | null> => {
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

    return data as UserVote;
  } catch (error) {
    console.error('Error in getUserVote:', error);
    return null;
  }
};

/**
 * Upvote a meme
 */
export const upvoteMeme = async (userId: string, memeId: string): Promise<UserVote | null> => {
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

        return data as UserVote;
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

      return data as UserVote;
    }
  } catch (error) {
    console.error('Error in upvoteMeme:', error);
    return null;
  }
};

/**
 * Downvote a meme
 */
export const downvoteMeme = async (userId: string, memeId: string): Promise<UserVote | null> => {
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

        return data as UserVote;
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

      return data as UserVote;
    }
  } catch (error) {
    console.error('Error in downvoteMeme:', error);
    return null;
  }
};

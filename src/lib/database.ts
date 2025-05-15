
import { supabase } from './supabase';
import { Prompt, User, Meme, Battle } from './types';

/**
 * Get the current day of the year (1-366)
 * @returns Number representing the current day of the year
 */
export function getCurrentDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Gets the active daily challenge from the Supabase database
 * @returns Promise with the daily challenge or null if not found
 */
export async function getDailyChallenge(): Promise<Prompt | null> {
  try {
    console.log('Getting daily challenge from database');
    const dayOfYear = getCurrentDayOfYear();
    console.log('Current day of year:', dayOfYear);
    
    // First try to get from the daily_challenges table
    const { data: dailyChallenge, error: dailyChallengeError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('day_of_year', dayOfYear)
      .single();
    
    if (dailyChallengeError) {
      console.log('Error getting daily challenge:', dailyChallengeError);
      
      // If not found in daily_challenges, check for active prompts
      const { data: activePrompt, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('active', true)
        .order('start_date', { ascending: false })
        .limit(1)
        .single();
      
      if (promptError) {
        console.log('Error getting active prompt:', promptError);
        return null;
      }
      
      if (activePrompt) {
        console.log('Found active prompt:', activePrompt);
        return {
          id: activePrompt.id,
          text: activePrompt.text,
          theme: activePrompt.theme || '',
          tags: activePrompt.tags || [],
          active: activePrompt.active,
          startDate: new Date(activePrompt.start_date),
          endDate: new Date(activePrompt.end_date)
        };
      }
      
      return null;
    }
    
    if (dailyChallenge) {
      console.log('Found daily challenge:', dailyChallenge);
      
      // Check if there's already a corresponding prompt record
      let promptId = null;
      const { data: existingPrompt } = await supabase
        .from('prompts')
        .select('id')
        .eq('daily_challenge_id', dailyChallenge.id)
        .eq('active', true)
        .single();
      
      if (existingPrompt) {
        promptId = existingPrompt.id;
      } else {
        // Create a new prompt record linked to this daily challenge
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const { data: newPrompt, error: createError } = await supabase
          .from('prompts')
          .insert({
            text: dailyChallenge.text,
            theme: dailyChallenge.theme,
            tags: dailyChallenge.tags,
            daily_challenge_id: dailyChallenge.id,
            active: true,
            start_date: now.toISOString(),
            end_date: tomorrow.toISOString()
          })
          .select('id')
          .single();
        
        if (createError) {
          console.error('Error creating prompt from daily challenge:', createError);
        } else if (newPrompt) {
          promptId = newPrompt.id;
        }
      }
      
      return {
        id: promptId || dailyChallenge.id, // Use the prompt ID if available, otherwise the challenge ID
        text: dailyChallenge.text,
        theme: dailyChallenge.theme || '',
        tags: dailyChallenge.tags || [],
        active: true,
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 86400000)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error in getDailyChallenge:', error);
    return null;
  }
}

/**
 * Create a new meme in the database
 */
export async function createMeme(memeData: {
  prompt: string;
  prompt_id?: string | null;
  imageUrl: string;
  ipfsCid?: string;
  caption: string;
  creatorId: string;
  votes: number;
  createdAt: Date;
  tags: string[];
}): Promise<Meme | null> {
  try {
    // Insert into the memes table
    const { data, error } = await supabase
      .from('memes')
      .insert({
        prompt: memeData.prompt,
        prompt_id: memeData.prompt_id || null,
        image_url: memeData.imageUrl,
        ipfs_cid: memeData.ipfsCid || null,
        caption: memeData.caption,
        creator_id: memeData.creatorId,
        votes: memeData.votes || 0,
        created_at: memeData.createdAt.toISOString(),
        tags: memeData.tags || []
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating meme:', error);
      return null;
    }

    if (!data) {
      console.error('No data returned after creating meme');
      return null;
    }

    // Convert to Meme type
    return {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id || '',
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      votes: data.votes || 0,
      createdAt: new Date(data.created_at),
      tags: data.tags || []
    };
  } catch (error) {
    console.error('Error in createMeme:', error);
    return null;
  }
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error getting profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      level: data.level || 1,
      xp: data.xp || 0,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    // Convert from User type to database schema
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
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      level: data.level || 1,
      xp: data.xp || 0,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
}

/**
 * Create a new user profile
 */
export async function createProfile(profileData: {
  id: string;
  username: string;
  avatarUrl?: string;
}): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profileData.id,
        username: profileData.username,
        avatar_url: profileData.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profileData.id}`,
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
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      level: data.level || 1,
      xp: data.xp || 0,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
}

/**
 * Get battle by ID
 */
export async function getBattleById(battleId: string): Promise<Battle | null> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .select(`
        *,
        meme_one:meme_one_id(*),
        meme_two:meme_two_id(*)
      `)
      .eq('id', battleId)
      .single();

    if (error) {
      console.error('Error getting battle:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      promptId: data.prompt_id || '',
      memeOneId: data.meme_one_id,
      memeTwoId: data.meme_two_id,
      status: data.status,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      creator_id: data.creator_id || '',
      voteCount: data.vote_count || 0,
      winnerId: data.winner_id || '',
      memeOne: data.meme_one ? {
        id: data.meme_one.id,
        prompt: data.meme_one.prompt || '',
        prompt_id: data.meme_one.prompt_id || '',
        imageUrl: data.meme_one.image_url,
        caption: data.meme_one.caption,
        creatorId: data.meme_one.creator_id,
        votes: data.meme_one.votes || 0,
        createdAt: new Date(data.meme_one.created_at),
        ipfsCid: data.meme_one.ipfs_cid || '',
        tags: data.meme_one.tags || []
      } : undefined,
      memeTwo: data.meme_two ? {
        id: data.meme_two.id,
        prompt: data.meme_two.prompt || '',
        prompt_id: data.meme_two.prompt_id || '',
        imageUrl: data.meme_two.image_url,
        caption: data.meme_two.caption,
        creatorId: data.meme_two.creator_id,
        votes: data.meme_two.votes || 0,
        createdAt: new Date(data.meme_two.created_at),
        ipfsCid: data.meme_two.ipfs_cid || '',
        tags: data.meme_two.tags || []
      } : undefined,
      is_community: data.is_community || false
    };
  } catch (error) {
    console.error('Error in getBattleById:', error);
    return null;
  }
}

/**
 * Get prompt by ID
 */
export async function getPromptById(promptId: string): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();

    if (error) {
      console.error('Error getting prompt:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      text: data.text,
      theme: data.theme || '',
      tags: data.tags || [],
      active: data.active,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      is_community: data.is_community || false,
      description: data.description || '',
      creator_id: data.creator_id || ''
    };
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
}

/**
 * Cast a vote for a meme in a battle
 */
export async function castVote(userId: string, battleId: string, memeId: string): Promise<boolean> {
  try {
    // Check if the user has already voted on this battle
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('battle_id', battleId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return false;
    }

    if (existingVote) {
      console.log('User has already voted on this battle');
      return false;
    }

    // Create the vote
    const { data: newVote, error: voteError } = await supabase
      .from('votes')
      .insert({
        user_id: userId,
        battle_id: battleId,
        meme_id: memeId
      })
      .select()
      .single();

    if (voteError) {
      console.error('Error casting vote:', voteError);
      return false;
    }

    // Increment the vote count for the meme
    const { error: memeError } = await supabase
      .from('memes')
      .update({ votes: supabase.rpc('increment', { inc: 1 }) })
      .eq('id', memeId);

    if (memeError) {
      console.error('Error incrementing meme votes:', memeError);
    }

    // Increment the vote count for the battle
    const { error: battleError } = await supabase
      .from('battles')
      .update({ vote_count: supabase.rpc('increment', { inc: 1 }) })
      .eq('id', battleId);

    if (battleError) {
      console.error('Error incrementing battle vote count:', battleError);
    }

    return true;
  } catch (error) {
    console.error('Error in castVote:', error);
    return false;
  }
}

/**
 * Get active battles
 */
export async function getActiveBattles(limit = 10, offset = 0, filter: 'all' | 'community' | 'official' = 'all'): Promise<Battle[]> {
  try {
    let query = supabase
      .from('battles')
      .select(`
        *,
        meme_one:meme_one_id(*),
        meme_two:meme_two_id(*)
      `)
      .eq('status', 'active')
      .order('start_time', { ascending: false });

    if (filter === 'community') {
      query = query.eq('is_community', true);
    } else if (filter === 'official') {
      query = query.eq('is_community', false);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error getting active battles:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(battle => ({
      id: battle.id,
      promptId: battle.prompt_id || '',
      memeOneId: battle.meme_one_id,
      memeTwoId: battle.meme_two_id,
      status: battle.status,
      startTime: new Date(battle.start_time),
      endTime: new Date(battle.end_time),
      creator_id: battle.creator_id || '',
      voteCount: battle.vote_count || 0,
      winnerId: battle.winner_id || '',
      memeOne: battle.meme_one ? {
        id: battle.meme_one.id,
        prompt: battle.meme_one.prompt || '',
        prompt_id: battle.meme_one.prompt_id || '',
        imageUrl: battle.meme_one.image_url,
        caption: battle.meme_one.caption,
        creatorId: battle.meme_one.creator_id,
        votes: battle.meme_one.votes || 0,
        createdAt: new Date(battle.meme_one.created_at),
        ipfsCid: battle.meme_one.ipfs_cid || '',
        tags: battle.meme_one.tags || []
      } : undefined,
      memeTwo: battle.meme_two ? {
        id: battle.meme_two.id,
        prompt: battle.meme_two.prompt || '',
        prompt_id: battle.meme_two.prompt_id || '',
        imageUrl: battle.meme_two.image_url,
        caption: battle.meme_two.caption,
        creatorId: battle.meme_two.creator_id,
        votes: battle.meme_two.votes || 0,
        createdAt: new Date(battle.meme_two.created_at),
        ipfsCid: battle.meme_two.ipfs_cid || '',
        tags: battle.meme_two.tags || []
      } : undefined,
      is_community: battle.is_community || false
    }));
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
}

/**
 * Get prompts for battle creation
 */
export async function getPrompts(limit = 10, offset = 0, isCommunity?: boolean): Promise<Prompt[]> {
  try {
    let query = supabase
      .from('prompts')
      .select('*')
      .eq('active', true)
      .order('start_date', { ascending: false });

    if (isCommunity !== undefined) {
      query = query.eq('is_community', isCommunity);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error getting prompts:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(prompt => ({
      id: prompt.id,
      text: prompt.text,
      theme: prompt.theme || '',
      tags: prompt.tags || [],
      active: prompt.active,
      startDate: new Date(prompt.start_date),
      endDate: new Date(prompt.end_date),
      is_community: prompt.is_community || false,
      description: prompt.description || '',
      creator_id: prompt.creator_id || ''
    }));
  } catch (error) {
    console.error('Error in getPrompts:', error);
    return [];
  }
}

/**
 * Create a new prompt
 */
export async function createPrompt(promptData: {
  text: string;
  theme?: string;
  tags: string[];
  description?: string;
  is_community?: boolean;
  creator_id?: string;
  startDate: Date;
  endDate: Date;
}): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        text: promptData.text,
        theme: promptData.theme || '',
        tags: promptData.tags || [],
        description: promptData.description || '',
        is_community: promptData.is_community || false,
        creator_id: promptData.creator_id || null,
        start_date: promptData.startDate.toISOString(),
        end_date: promptData.endDate.toISOString(),
        active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating prompt:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      text: data.text,
      theme: data.theme || '',
      tags: data.tags || [],
      active: data.active,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      is_community: data.is_community || false,
      description: data.description || '',
      creator_id: data.creator_id || ''
    };
  } catch (error) {
    console.error('Error in createPrompt:', error);
    return null;
  }
}

/**
 * Get trending memes
 */
export async function getTrendingMemes(limit = 10): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select(`
        *,
        creator:creator_id(username, avatar_url)
      `)
      .order('votes', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending memes:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(meme => ({
      id: meme.id,
      prompt: meme.prompt || '',
      prompt_id: meme.prompt_id || '',
      imageUrl: meme.image_url,
      ipfsCid: meme.ipfs_cid || '',
      caption: meme.caption,
      creatorId: meme.creator_id,
      votes: meme.votes || 0,
      createdAt: new Date(meme.created_at),
      tags: meme.tags || [],
      creator: meme.creator ? {
        id: meme.creator_id,
        username: meme.creator.username,
        avatarUrl: meme.creator.avatar_url || '',
        memeStreak: 0,
        wins: 0,
        losses: 0,
        level: 1,
        xp: 0,
        createdAt: new Date()
      } : undefined
    }));
  } catch (error) {
    console.error('Error in getTrendingMemes:', error);
    return [];
  }
}

/**
 * Get newest memes
 */
export async function getNewestMemes(limit = 10): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select(`
        *,
        creator:creator_id(username, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching newest memes:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(meme => ({
      id: meme.id,
      prompt: meme.prompt || '',
      prompt_id: meme.prompt_id || '',
      imageUrl: meme.image_url,
      ipfsCid: meme.ipfs_cid || '',
      caption: meme.caption,
      creatorId: meme.creator_id,
      votes: meme.votes || 0,
      createdAt: new Date(meme.created_at),
      tags: meme.tags || [],
      creator: meme.creator ? {
        id: meme.creator_id,
        username: meme.creator.username,
        avatarUrl: meme.creator.avatar_url || '',
        memeStreak: 0,
        wins: 0,
        losses: 0,
        level: 1,
        xp: 0,
        createdAt: new Date()
      } : undefined
    }));
  } catch (error) {
    console.error('Error in getNewestMemes:', error);
    return [];
  }
}

/**
 * Get memes by user ID
 */
export async function getMemesByUserId(userId: string): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user memes:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(meme => ({
      id: meme.id,
      prompt: meme.prompt || '',
      prompt_id: meme.prompt_id || '',
      imageUrl: meme.image_url,
      ipfsCid: meme.ipfs_cid || '',
      caption: meme.caption,
      creatorId: meme.creator_id,
      votes: meme.votes || 0,
      createdAt: new Date(meme.created_at),
      tags: meme.tags || []
    }));
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
}

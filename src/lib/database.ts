
import { supabase } from '@/integrations/supabase/client';
import { User, Battle, Prompt, Meme } from './types';

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
  battleId?: string | null;
}): Promise<Meme | null> {
  try {
    console.log("Creating meme with data:", memeData);
    
    // Insert into the memes table
    // We're going to make prompt_id and battle_id optional
    const dataToInsert = {
      prompt: memeData.prompt,
      image_url: memeData.imageUrl,
      ipfs_cid: memeData.ipfsCid || null,
      caption: memeData.caption,
      creator_id: memeData.creatorId,
      votes: memeData.votes || 0,
      created_at: memeData.createdAt.toISOString(),
      tags: memeData.tags || []
      // battle_id is intentionally omitted here, it will be conditionally added below
    };
    
    // Only add prompt_id if it exists and is valid
    if (memeData.prompt_id) {
      // Try to find if the prompt exists
      const { data: promptExists } = await supabase
        .from('prompts')
        .select('id')
        .eq('id', memeData.prompt_id)
        .maybeSingle();
        
      // Only include prompt_id if it exists in the prompt table
      if (promptExists) {
        dataToInsert['prompt_id'] = memeData.prompt_id;
      } else {
        console.log(`Prompt with ID ${memeData.prompt_id} not found, omitting from meme data`);
      }
    }

    // Only add battle_id if it exists and is valid
    if (memeData.battleId) {
      // Try to find if the battle exists
      const { data: battleExists } = await supabase
        .from('battles')
        .select('id')
        .eq('id', memeData.battleId)
        .maybeSingle();
        
      // Only include battle_id if it exists in the battles table
      if (battleExists) {
        dataToInsert['battle_id'] = memeData.battleId;
      } else {
        console.log(`Battle with ID ${memeData.battleId} not found, omitting from meme data`);
      }
    }

    const { data, error } = await supabase
      .from('memes')
      .insert(dataToInsert)
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

    console.log("Meme created successfully:", data);

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
      tags: data.tags || [],
      battleId: data.battle_id || undefined,
      isBattleSubmission: data.is_battle_submission
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
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url,
      level: data.level || 1,
      xp: data.xp || 0,
      memeStreak: data.meme_streak || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in getProfile:', error);
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
        avatar_url: profileData.avatarUrl,
        level: 1,
        xp: 0,
        meme_streak: 0,
        wins: 0,
        losses: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url,
      level: data.level,
      xp: data.xp,
      memeStreak: data.meme_streak,
      wins: data.wins,
      losses: data.losses,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    // Convert from camelCase to snake_case for database
    const dbUpdates: any = {};
    
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.level) dbUpdates.level = updates.level;
    if (updates.xp) dbUpdates.xp = updates.xp;
    if (updates.memeStreak) dbUpdates.meme_streak = updates.memeStreak;
    if (updates.wins) dbUpdates.wins = updates.wins;
    if (updates.losses) dbUpdates.losses = updates.losses;
    
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
    
    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url,
      level: data.level,
      xp: data.xp,
      memeStreak: data.meme_streak,
      wins: data.wins,
      losses: data.losses,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
}

/**
 * Get active battles
 */
export async function getActiveBattles(limit: number = 10, offset: number = 0, filter: string = 'all'): Promise<Battle[]> {
  try {
    let query = supabase
      .from('battles')
      .select(`
        *,
        prompts!battles_prompt_id_fkey (*)
      `)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Apply additional filters if needed
    if (filter === 'community') {
      query = query.eq('is_community', true);
    } else if (filter === 'official') {
      query = query.eq('is_community', false);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching battles:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Get the meme details for each battle
    const battles = await Promise.all(data.map(async (battle) => {
      // Get meme one details
      let memeOne = null;
      if (battle.meme_one_id) {
        const { data: meme1Data } = await supabase
          .from('memes')
          .select('*')
          .eq('id', battle.meme_one_id)
          .single();
          
        if (meme1Data) {
          memeOne = {
            id: meme1Data.id,
            prompt: meme1Data.prompt || '',
            prompt_id: meme1Data.prompt_id || '',
            imageUrl: meme1Data.image_url,
            ipfsCid: meme1Data.ipfs_cid || '',
            caption: meme1Data.caption,
            creatorId: meme1Data.creator_id,
            votes: meme1Data.votes || 0,
            createdAt: new Date(meme1Data.created_at),
            tags: meme1Data.tags || [],
            battleId: meme1Data.battle_id || ''
          };
        }
      }
      
      // Get meme two details
      let memeTwo = null;
      if (battle.meme_two_id) {
        const { data: meme2Data } = await supabase
          .from('memes')
          .select('*')
          .eq('id', battle.meme_two_id)
          .single();
          
        if (meme2Data) {
          memeTwo = {
            id: meme2Data.id,
            prompt: meme2Data.prompt || '',
            prompt_id: meme2Data.prompt_id || '',
            imageUrl: meme2Data.image_url,
            ipfsCid: meme2Data.ipfs_cid || '',
            caption: meme2Data.caption,
            creatorId: meme2Data.creator_id,
            votes: meme2Data.votes || 0,
            createdAt: new Date(meme2Data.created_at),
            tags: meme2Data.tags || [],
            battleId: meme2Data.battle_id || ''
          };
        }
      }
      
      // Convert database prompt to our Prompt type
      const promptData = battle.prompts;
      let prompt: Prompt | undefined = undefined;
      
      if (promptData) {
        prompt = {
          id: promptData.id,
          text: promptData.text,
          theme: promptData.theme || '',
          description: promptData.description || '',
          is_community: promptData.is_community || false,
          creator_id: promptData.creator_id || '',
          startDate: new Date(promptData.start_date),
          endDate: new Date(promptData.end_date),
          active: promptData.active,
          tags: promptData.tags || [],
          daily_challenge_id: promptData.daily_challenge_id
        };
      }
      
      // Create the battle object
      return {
        id: battle.id,
        status: battle.status as 'active' | 'completed' | 'cancelled',
        startTime: new Date(battle.start_time),
        endTime: new Date(battle.end_time),
        prompt,
        promptId: battle.prompt_id || '',
        memeOneId: battle.meme_one_id,
        memeTwoId: battle.meme_two_id,
        creator_id: battle.creator_id || '',
        winnerId: battle.winner_id || '',
        voteCount: battle.vote_count,
        is_community: battle.is_community || false,
        memeOne,
        memeTwo
      };
    }));
    
    return battles;
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
}

/**
 * Get battle by ID
 */
export async function getBattleById(battleId: string): Promise<Battle | null> {
  try {
    const { data: battle, error } = await supabase
      .from('battles')
      .select(`
        *,
        prompts!battles_prompt_id_fkey (*)
      `)
      .eq('id', battleId)
      .single();
    
    if (error) {
      console.error('Error fetching battle:', error);
      return null;
    }
    
    // Get meme one details
    let memeOne = null;
    if (battle.meme_one_id) {
      const { data: meme1Data } = await supabase
        .from('memes')
        .select('*')
        .eq('id', battle.meme_one_id)
        .single();
        
      if (meme1Data) {
        memeOne = {
          id: meme1Data.id,
          prompt: meme1Data.prompt || '',
          prompt_id: meme1Data.prompt_id || '',
          imageUrl: meme1Data.image_url,
          ipfsCid: meme1Data.ipfs_cid || '',
          caption: meme1Data.caption,
          creatorId: meme1Data.creator_id,
          votes: meme1Data.votes || 0,
          createdAt: new Date(meme1Data.created_at),
          tags: meme1Data.tags || [],
          battleId: meme1Data.battle_id || ''
        };
      }
    }
    
    // Get meme two details
    let memeTwo = null;
    if (battle.meme_two_id) {
      const { data: meme2Data } = await supabase
        .from('memes')
        .select('*')
        .eq('id', battle.meme_two_id)
        .single();
        
      if (meme2Data) {
        memeTwo = {
          id: meme2Data.id,
          prompt: meme2Data.prompt || '',
          prompt_id: meme2Data.prompt_id || '',
          imageUrl: meme2Data.image_url,
          ipfsCid: meme2Data.ipfs_cid || '',
          caption: meme2Data.caption,
          creatorId: meme2Data.creator_id,
          votes: meme2Data.votes || 0,
          createdAt: new Date(meme2Data.created_at),
          tags: meme2Data.tags || [],
          battleId: meme2Data.battle_id || ''
        };
      }
    }
    
    // Convert database prompt to our Prompt type
    const promptData = battle.prompts;
    let prompt: Prompt | undefined = undefined;
    
    if (promptData) {
      prompt = {
        id: promptData.id,
        text: promptData.text,
        theme: promptData.theme || '',
        description: promptData.description || '',
        is_community: promptData.is_community || false,
        creator_id: promptData.creator_id || '',
        startDate: new Date(promptData.start_date),
        endDate: new Date(promptData.end_date),
        active: promptData.active,
        tags: promptData.tags || [],
        daily_challenge_id: promptData.daily_challenge_id
      };
    }
    
    return {
      id: battle.id,
      status: battle.status as 'active' | 'completed' | 'cancelled',
      startTime: new Date(battle.start_time),
      endTime: new Date(battle.end_time),
      prompt,
      promptId: battle.prompt_id || '',
      memeOneId: battle.meme_one_id,
      memeTwoId: battle.meme_two_id,
      creator_id: battle.creator_id || '',
      winnerId: battle.winner_id || '',
      voteCount: battle.vote_count,
      is_community: battle.is_community || false,
      memeOne,
      memeTwo
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
      console.error('Error fetching prompt:', error);
      return null;
    }
    
    return {
      id: data.id,
      text: data.text,
      theme: data.theme || '',
      description: data.description || '',
      is_community: data.is_community || false,
      creator_id: data.creator_id || '',
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      active: data.active,
      tags: data.tags || [],
      daily_challenge_id: data.daily_challenge_id
    };
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
}

/**
 * Get prompts
 */
export async function getPrompts(limit: number = 10, offset: number = 0, isCommunity?: boolean): Promise<Prompt[]> {
  try {
    let query = supabase
      .from('prompts')
      .select('*')
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // Filter by community status if specified
    if (typeof isCommunity === 'boolean') {
      query = query.eq('is_community', isCommunity);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.map(prompt => ({
      id: prompt.id,
      text: prompt.text,
      theme: prompt.theme || '',
      description: prompt.description || '',
      is_community: prompt.is_community || false,
      creator_id: prompt.creator_id || '',
      startDate: new Date(prompt.start_date),
      endDate: new Date(prompt.end_date),
      active: prompt.active,
      tags: prompt.tags || [],
      daily_challenge_id: prompt.daily_challenge_id
    }));
  } catch (error) {
    console.error('Error in getPrompts:', error);
    return [];
  }
}

/**
 * Cast a vote for a meme in a battle
 */
export async function castVote(battleId: string, memeId: string, userId: string): Promise<boolean> {
  try {
    // First check if the user has already voted in this battle
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('id')
      .eq('battle_id', battleId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error('Error checking existing vote:', checkError);
      return false;
    }
    
    if (existingVote) {
      console.log('User has already voted in this battle');
      return false;
    }
    
    // Record the vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert({
        battle_id: battleId,
        meme_id: memeId,
        user_id: userId
      });
    
    if (voteError) {
      console.error('Error recording vote:', voteError);
      return false;
    }
    
    // Increment the vote count on the meme
    const { error: memeError } = await supabase
      .rpc('increment_meme_vote', {
        meme_id: memeId
      });
    
    if (memeError) {
      console.error('Error incrementing meme vote:', memeError);
      return false;
    }
    
    // Update battle vote count
    const { error: battleError } = await supabase
      .rpc('increment_battle_vote', {
        battle_id: battleId
      });
    
    if (battleError) {
      console.error('Error incrementing battle vote count:', battleError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in castVote:', error);
    return false;
  }
}

/**
 * Get trending memes
 */
export async function getTrendingMemes(limit: number = 10): Promise<Meme[]> {
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
      battleId: meme.battle_id || ''
    }));
  } catch (error) {
    console.error('Error in getTrendingMemes:', error);
    return [];
  }
}

/**
 * Get newest memes
 */
export async function getNewestMemes(limit: number = 10): Promise<Meme[]> {
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
      battleId: meme.battle_id || ''
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
      tags: meme.tags || [],
      battleId: meme.battle_id || ''
    }));
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
}

/**
 * Get memes by battle ID
 */
export async function getMemesByBattleId(battleId: string): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('battle_id', battleId)
      .order('votes', { ascending: false });
    
    if (error) {
      console.error('Error fetching battle memes:', error);
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
      battleId: meme.battle_id || undefined,
      isBattleSubmission: meme.is_battle_submission
    }));
  } catch (error) {
    console.error('Error in getMemesByBattleId:', error);
    return [];
  }
}

/**
 * Create a new prompt
 */
export async function createPrompt(promptData: {
  text: string;
  theme?: string;
  description?: string;
  tags: string[];
  is_community: boolean;
  creator_id: string;
  startDate: Date;
  endDate: Date;
}): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        text: promptData.text,
        theme: promptData.theme || null,
        description: promptData.description || null,
        tags: promptData.tags,
        is_community: promptData.is_community,
        creator_id: promptData.creator_id,
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
    
    return {
      id: data.id,
      text: data.text,
      theme: data.theme || '',
      description: data.description || '',
      is_community: data.is_community || false,
      creator_id: data.creator_id || '',
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      active: data.active,
      tags: data.tags || [],
      daily_challenge_id: data.daily_challenge_id
    };
  } catch (error) {
    console.error('Error in createPrompt:', error);
    return null;
  }
}

/**
 * Get daily challenge for the current day
 */
export async function getDailyChallenge(dayOfYear?: number): Promise<Prompt | null> {
  try {
    // If day not provided, calculate current day of year
    const currentDay = dayOfYear || getCurrentDayOfYear();
    
    // Use the get_daily_challenge database function
    const { data: challengeData, error } = await supabase
      .rpc('get_daily_challenge', { day: currentDay });
    
    if (error) {
      console.error('Error fetching daily challenge:', error);
      return null;
    }
    
    if (!challengeData || challengeData.length === 0) {
      console.log(`No challenge found for day ${currentDay}`);
      return null;
    }
    
    const challenge = challengeData[0];
    
    // Check if a prompt is linked to this challenge
    const { data: linkedPrompt } = await supabase
      .from('prompts')
      .select('*')
      .eq('daily_challenge_id', challenge.id)
      .maybeSingle();
    
    if (linkedPrompt) {
      return {
        id: linkedPrompt.id,
        text: linkedPrompt.text,
        theme: linkedPrompt.theme || '',
        description: linkedPrompt.description || '',
        is_community: linkedPrompt.is_community || false,
        creator_id: linkedPrompt.creator_id || '',
        startDate: new Date(linkedPrompt.start_date),
        endDate: new Date(linkedPrompt.end_date),
        active: linkedPrompt.active,
        tags: linkedPrompt.tags || [],
        daily_challenge_id: linkedPrompt.daily_challenge_id,
        challengeDay: currentDay
      };
    }
    
    // No linked prompt found, create a new one
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const { data: newPrompt, error: newPromptError } = await supabase
      .from('prompts')
      .insert({
        text: challenge.text,
        theme: challenge.theme,
        tags: challenge.tags || [],
        is_community: false,
        creator_id: null,
        start_date: now.toISOString(),
        end_date: tomorrow.toISOString(),
        active: true,
        daily_challenge_id: challenge.id
      })
      .select()
      .single();
    
    if (newPromptError) {
      console.error('Error creating prompt from challenge:', newPromptError);
      
      // Return a direct prompt from the challenge instead
      return {
        id: challenge.id,
        text: challenge.text,
        theme: challenge.theme || '',
        tags: challenge.tags || [],
        active: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        is_community: false,
        creator_id: 'system',
        daily_challenge_id: challenge.id,
        challengeDay: currentDay
      };
    }
    
    return {
      id: newPrompt.id,
      text: newPrompt.text,
      theme: newPrompt.theme || '',
      description: newPrompt.description || '',
      is_community: newPrompt.is_community || false,
      creator_id: newPrompt.creator_id || '',
      startDate: new Date(newPrompt.start_date),
      endDate: new Date(newPrompt.end_date),
      active: newPrompt.active,
      tags: newPrompt.tags || [],
      daily_challenge_id: newPrompt.daily_challenge_id,
      challengeDay: currentDay
    };
  } catch (error) {
    console.error('Error in getDailyChallenge:', error);
    return null;
  }
}

/**
 * Get the current day of the year (1-366)
 */
export function getCurrentDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

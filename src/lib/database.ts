
import { supabase } from './supabase';
import { User, Meme, Prompt, Battle, Vote } from './types';
import { getFallbackChallenge } from './dailyChallenges';
import { v4 as uuidv4 } from 'uuid';

// User profile functions
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
    
    if (!data) return null;
    
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

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    // Convert from our type to the DB schema
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
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
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

export async function createProfile(profile: Partial<User>): Promise<User | null> {
  try {
    if (!profile.id) {
      console.error('User ID is required to create a profile');
      return null;
    }
    
    // Convert to database schema
    const dbProfile = {
      id: profile.id,
      username: profile.username || `user_${profile.id.substring(0, 8)}`,
      avatar_url: profile.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profile.id}`,
      meme_streak: profile.memeStreak || 0,
      wins: profile.wins || 0,
      losses: profile.losses || 0,
      level: profile.level || 1,
      xp: profile.xp || 0
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(dbProfile)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
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

// Meme functions
export async function createMeme(meme: Partial<Meme>): Promise<Meme | null> {
  try {
    // Convert from our type to the DB schema
    const dbMeme = {
      prompt: meme.prompt || null,
      prompt_id: meme.prompt_id || null,
      image_url: meme.imageUrl,
      ipfs_cid: meme.ipfsCid || null,
      caption: meme.caption || '',
      creator_id: meme.creatorId,
      votes: meme.votes || 0,
      tags: meme.tags || [],
      battle_id: meme.battleId || null,
      is_battle_submission: meme.isBattleSubmission || false,
      challenge_day: meme.challengeDay || null
    };
    
    const { data, error } = await supabase
      .from('memes')
      .insert(dbMeme)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating meme:', error);
      return null;
    }
    
    return {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id || undefined,
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      votes: data.votes || 0,
      createdAt: new Date(data.created_at),
      tags: data.tags || [],
      isBattleSubmission: data.is_battle_submission || false,
      battleId: data.battle_id || undefined,
      challengeDay: data.challenge_day || undefined
    };
  } catch (error) {
    console.error('Error in createMeme:', error);
    return null;
  }
}

export async function getMemeById(memeId: string): Promise<Meme | null> {
  try {
    // First get the meme
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('id', memeId)
      .single();
    
    if (error) {
      console.error('Error fetching meme:', error);
      return null;
    }
    
    // Then get the creator if needed
    let creator;
    if (data.creator_id) {
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', data.creator_id)
        .maybeSingle();
        
      if (!creatorError && creatorData) {
        creator = {
          id: creatorData.id,
          username: creatorData.username,
          avatarUrl: creatorData.avatar_url || '',
          memeStreak: 0,
          wins: 0,
          losses: 0,
          level: 1,
          xp: 0,
          createdAt: new Date()
        };
      }
    }
    
    return {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id || undefined,
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      creator: creator,
      votes: data.votes || 0,
      createdAt: new Date(data.created_at),
      tags: data.tags || [],
      isBattleSubmission: data.is_battle_submission || false,
      battleId: data.battle_id || undefined,
      challengeDay: data.challenge_day || undefined
    };
  } catch (error) {
    console.error('Error in getMemeById:', error);
    return null;
  }
}

export async function getMemesByUserId(userId: string): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching memes by user ID:', error);
      return [];
    }
    
    return data.map(m => ({
      id: m.id,
      prompt: m.prompt || '',
      prompt_id: m.prompt_id || undefined,
      imageUrl: m.image_url,
      ipfsCid: m.ipfs_cid || '',
      caption: m.caption,
      creatorId: m.creator_id,
      votes: m.votes || 0,
      createdAt: new Date(m.created_at),
      tags: m.tags || [],
      isBattleSubmission: m.is_battle_submission || false,
      battleId: m.battle_id || undefined,
      challengeDay: m.challenge_day || undefined
    }));
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
}

export async function getTrendingMemes(limit: number = 10): Promise<Meme[]> {
  try {
    // Get memes first
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('votes', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching trending memes:', error);
      return [];
    }
    
    // Then get the creators for those memes
    const memes = await Promise.all(data.map(async (m) => {
      let creator;
      if (m.creator_id) {
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', m.creator_id)
          .maybeSingle();
          
        if (!creatorError && creatorData) {
          creator = {
            id: creatorData.id,
            username: creatorData.username,
            avatarUrl: creatorData.avatar_url || '',
            memeStreak: 0,
            wins: 0,
            losses: 0,
            level: 1,
            xp: 0,
            createdAt: new Date()
          };
        }
      }
      
      return {
        id: m.id,
        prompt: m.prompt || '',
        prompt_id: m.prompt_id || undefined,
        imageUrl: m.image_url,
        ipfsCid: m.ipfs_cid || '',
        caption: m.caption,
        creatorId: m.creator_id,
        creator: creator,
        votes: m.votes || 0,
        createdAt: new Date(m.created_at),
        tags: m.tags || [],
        isBattleSubmission: m.is_battle_submission || false,
        battleId: m.battle_id || undefined,
        challengeDay: m.challenge_day || undefined
      };
    }));
    
    return memes;
  } catch (error) {
    console.error('Error in getTrendingMemes:', error);
    return [];
  }
}

export async function getNewestMemes(limit: number = 10): Promise<Meme[]> {
  try {
    // Get memes first
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching newest memes:', error);
      return [];
    }
    
    // Then get the creators for those memes
    const memes = await Promise.all(data.map(async (m) => {
      let creator;
      if (m.creator_id) {
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', m.creator_id)
          .maybeSingle();
          
        if (!creatorError && creatorData) {
          creator = {
            id: creatorData.id,
            username: creatorData.username,
            avatarUrl: creatorData.avatar_url || '',
            memeStreak: 0,
            wins: 0,
            losses: 0,
            level: 1,
            xp: 0,
            createdAt: new Date()
          };
        }
      }
      
      return {
        id: m.id,
        prompt: m.prompt || '',
        prompt_id: m.prompt_id || undefined,
        imageUrl: m.image_url,
        ipfsCid: m.ipfs_cid || '',
        caption: m.caption,
        creatorId: m.creator_id,
        creator: creator,
        votes: m.votes || 0,
        createdAt: new Date(m.created_at),
        tags: m.tags || [],
        isBattleSubmission: m.is_battle_submission || false,
        battleId: m.battle_id || undefined,
        challengeDay: m.challenge_day || undefined
      };
    }));
    
    return memes;
  } catch (error) {
    console.error('Error in getNewestMemes:', error);
    return [];
  }
}

// Daily Challenge functions
export function getCurrentDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

export async function getDailyChallenge(): Promise<Prompt | null> {
  try {
    const dayOfYear = getCurrentDayOfYear();
    
    // First try to get from the daily_challenges table
    const { data: challengeData, error: challengeError } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('day_of_year', dayOfYear)
      .single();
    
    if (challengeError) {
      console.error('Error fetching daily challenge:', challengeError);
      
      // Try to get from the prompts table with daily_challenge_id
      const { data: promptData, error: promptError } = await supabase
        .from('prompts')
        .select('*')
        .eq('active', true)
        .order('start_date', { ascending: false })
        .limit(1)
        .single();
      
      if (promptError || !promptData) {
        console.error('Error fetching active prompt:', promptError);
        return null;
      }
      
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
        is_community: promptData.is_community || false,
        daily_challenge_id: promptData.daily_challenge_id || undefined,
        challengeDay: dayOfYear
      };
    }
    
    // If we get here, we found the challenge
    // Check if a prompt already exists for this daily challenge
    const { data: existingPrompt, error: promptError } = await supabase
      .from('prompts')
      .select('*')
      .eq('daily_challenge_id', challengeData.id)
      .single();
    
    if (!promptError && existingPrompt) {
      return {
        id: existingPrompt.id,
        text: existingPrompt.text,
        theme: existingPrompt.theme || '',
        tags: existingPrompt.tags || [],
        active: existingPrompt.active,
        startDate: new Date(existingPrompt.start_date),
        endDate: new Date(existingPrompt.end_date),
        description: existingPrompt.description || undefined,
        creator_id: existingPrompt.creator_id || undefined,
        is_community: existingPrompt.is_community || false,
        daily_challenge_id: existingPrompt.daily_challenge_id || undefined,
        challengeDay: dayOfYear
      };
    }
    
    // If no prompt exists, create one
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newPrompt = {
      text: challengeData.text,
      theme: challengeData.theme || null,
      tags: challengeData.tags || [],
      active: true,
      start_date: now.toISOString(),
      end_date: tomorrow.toISOString(),
      daily_challenge_id: challengeData.id
    };
    
    const { data: createdPrompt, error: createError } = await supabase
      .from('prompts')
      .insert(newPrompt)
      .select('*')
      .single();
    
    if (createError || !createdPrompt) {
      console.error('Error creating prompt from daily challenge:', createError);
      return null;
    }
    
    return {
      id: createdPrompt.id,
      text: createdPrompt.text,
      theme: createdPrompt.theme || '',
      tags: createdPrompt.tags || [],
      active: createdPrompt.active,
      startDate: new Date(createdPrompt.start_date),
      endDate: new Date(createdPrompt.end_date),
      description: createdPrompt.description || undefined,
      creator_id: createdPrompt.creator_id || undefined,
      is_community: createdPrompt.is_community || false,
      daily_challenge_id: createdPrompt.daily_challenge_id || undefined,
      challengeDay: dayOfYear
    };
  } catch (error) {
    console.error('Error in getDailyChallenge:', error);
    return null;
  }
}

// Prompt functions
export async function getActivePrompt(): Promise<Prompt | null> {
  try {
    // First try to get today's challenge
    const dailyChallenge = await getDailyChallenge();
    if (dailyChallenge) {
      return dailyChallenge;
    }
    
    // If no daily challenge, get the most recent active prompt
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('active', true)
      .order('start_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error('Error fetching active prompt:', error);
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
      description: data.description || undefined,
      creator_id: data.creator_id || undefined,
      is_community: data.is_community || false,
      daily_challenge_id: data.daily_challenge_id || undefined
    };
  } catch (error) {
    console.error('Error in getActivePrompt:', error);
    return null;
  }
}

export async function getPromptById(promptId: string): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .single();
    
    if (error || !data) {
      console.error('Error fetching prompt by ID:', error);
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
      description: data.description || undefined,
      creator_id: data.creator_id || undefined,
      is_community: data.is_community || false,
      daily_challenge_id: data.daily_challenge_id || undefined
    };
  } catch (error) {
    console.error('Error in getPromptById:', error);
    return null;
  }
}

export async function getPrompts(limit: number = 10, offset: number = 0, communityOnly: boolean = false): Promise<Prompt[]> {
  try {
    let query = supabase
      .from('prompts')
      .select('*')
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (communityOnly) {
      query = query.eq('is_community', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }
    
    return data.map(p => ({
      id: p.id,
      text: p.text,
      theme: p.theme || '',
      tags: p.tags || [],
      active: p.active,
      startDate: new Date(p.start_date),
      endDate: new Date(p.end_date),
      description: p.description || undefined,
      creator_id: p.creator_id || undefined,
      is_community: p.is_community || false,
      daily_challenge_id: p.daily_challenge_id || undefined
    }));
  } catch (error) {
    console.error('Error in getPrompts:', error);
    return [];
  }
}

export async function createPrompt(prompt: Partial<Prompt>): Promise<Prompt | null> {
  try {
    // Convert from our type to the DB schema
    const dbPrompt = {
      text: prompt.text,
      theme: prompt.theme || null,
      tags: prompt.tags || [],
      active: prompt.active !== undefined ? prompt.active : true,
      start_date: prompt.startDate ? prompt.startDate.toISOString() : new Date().toISOString(),
      end_date: prompt.endDate ? prompt.endDate.toISOString() : new Date(Date.now() + 86400000).toISOString(),
      description: prompt.description || null,
      creator_id: prompt.creator_id || null,
      is_community: prompt.is_community || false,
      daily_challenge_id: prompt.daily_challenge_id || null
    };
    
    const { data, error } = await supabase
      .from('prompts')
      .insert(dbPrompt)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating prompt:', error);
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
      description: data.description || undefined,
      creator_id: data.creator_id || undefined,
      is_community: data.is_community || false,
      daily_challenge_id: data.daily_challenge_id || undefined
    };
  } catch (error) {
    console.error('Error in createPrompt:', error);
    return null;
  }
}

// Battle functions
export async function getActiveBattles(limit: number = 10, offset: number = 0, filter: 'all' | 'official' | 'community' = 'all'): Promise<Battle[]> {
  try {
    // First get the battles
    let query = supabase
      .from('battles')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
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
    
    // Now build the full battle objects with related data
    const battles = await Promise.all(data.map(async (b) => {
      // Get meme one
      const { data: memeOneData, error: memeOneError } = b.meme_one_id ? await supabase
        .from('memes')
        .select('*')
        .eq('id', b.meme_one_id)
        .maybeSingle() : { data: null, error: null };
      
      // Get meme two
      const { data: memeTwoData, error: memeTwoError } = b.meme_two_id ? await supabase
        .from('memes')
        .select('*')
        .eq('id', b.meme_two_id)
        .maybeSingle() : { data: null, error: null };
      
      // Get prompt if available
      let promptData = null;
      if (b.prompt_id) {
        const { data: prompt, error: promptError } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', b.prompt_id)
          .maybeSingle();
        
        if (!promptError && prompt) {
          promptData = prompt;
        }
      }
      
      // Build the battle object
      return {
        id: b.id,
        promptId: b.prompt_id || '',
        prompt: promptData ? {
          id: promptData.id,
          text: promptData.text,
          theme: promptData.theme || '',
          tags: promptData.tags || [],
          active: promptData.active,
          startDate: new Date(promptData.start_date),
          endDate: new Date(promptData.end_date),
          description: promptData.description || undefined,
          creator_id: promptData.creator_id || undefined,
          is_community: promptData.is_community || false
        } : undefined,
        memeOneId: b.meme_one_id,
        memeTwoId: b.meme_two_id,
        memeOne: !memeOneError && memeOneData ? {
          id: memeOneData.id,
          prompt: memeOneData.prompt || '',
          prompt_id: memeOneData.prompt_id || undefined,
          imageUrl: memeOneData.image_url,
          ipfsCid: memeOneData.ipfs_cid || '',
          caption: memeOneData.caption,
          creatorId: memeOneData.creator_id,
          votes: memeOneData.votes || 0,
          createdAt: new Date(memeOneData.created_at),
          tags: memeOneData.tags || []
        } : undefined,
        memeTwo: !memeTwoError && memeTwoData ? {
          id: memeTwoData.id,
          prompt: memeTwoData.prompt || '',
          prompt_id: memeTwoData.prompt_id || undefined,
          imageUrl: memeTwoData.image_url,
          ipfsCid: memeTwoData.ipfs_cid || '',
          caption: memeTwoData.caption,
          creatorId: memeTwoData.creator_id,
          votes: memeTwoData.votes || 0,
          createdAt: new Date(memeTwoData.created_at),
          tags: memeTwoData.tags || []
        } : undefined,
        winnerId: b.winner_id || undefined,
        voteCount: b.vote_count || 0,
        startTime: new Date(b.start_time),
        endTime: new Date(b.end_time),
        status: b.status as 'active' | 'completed' | 'cancelled',
        is_community: b.is_community || false,
        creator_id: b.creator_id || undefined
      };
    }));
    
    return battles;
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
}

export async function getBattleById(battleId: string): Promise<Battle | null> {
  try {
    // Get the battle
    const { data: battleData, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();
    
    if (battleError || !battleData) {
      console.error('Error fetching battle by ID:', battleError);
      return null;
    }
    
    // Get meme one
    const { data: memeOneData, error: memeOneError } = battleData.meme_one_id ? await supabase
      .from('memes')
      .select('*')
      .eq('id', battleData.meme_one_id)
      .maybeSingle() : { data: null, error: null };
    
    // Get meme two
    const { data: memeTwoData, error: memeTwoError } = battleData.meme_two_id ? await supabase
      .from('memes')
      .select('*')
      .eq('id', battleData.meme_two_id)
      .maybeSingle() : { data: null, error: null };
    
    return {
      id: battleData.id,
      promptId: battleData.prompt_id || '',
      memeOneId: battleData.meme_one_id,
      memeTwoId: battleData.meme_two_id,
      memeOne: !memeOneError && memeOneData ? {
        id: memeOneData.id,
        prompt: memeOneData.prompt || '',
        prompt_id: memeOneData.prompt_id || undefined,
        imageUrl: memeOneData.image_url,
        ipfsCid: memeOneData.ipfs_cid || '',
        caption: memeOneData.caption,
        creatorId: memeOneData.creator_id,
        votes: memeOneData.votes || 0,
        createdAt: new Date(memeOneData.created_at),
        tags: memeOneData.tags || []
      } : undefined,
      memeTwo: !memeTwoError && memeTwoData ? {
        id: memeTwoData.id,
        prompt: memeTwoData.prompt || '',
        prompt_id: memeTwoData.prompt_id || undefined,
        imageUrl: memeTwoData.image_url,
        ipfsCid: memeTwoData.ipfs_cid || '',
        caption: memeTwoData.caption,
        creatorId: memeTwoData.creator_id,
        votes: memeTwoData.votes || 0,
        createdAt: new Date(memeTwoData.created_at),
        tags: memeTwoData.tags || []
      } : undefined,
      winnerId: battleData.winner_id || undefined,
      voteCount: battleData.vote_count || 0,
      startTime: new Date(battleData.start_time),
      endTime: new Date(battleData.end_time),
      status: battleData.status as 'active' | 'completed' | 'cancelled',
      is_community: battleData.is_community || false,
      creator_id: battleData.creator_id || undefined
    };
  } catch (error) {
    console.error('Error in getBattleById:', error);
    return null;
  }
}

export async function castVote(battleId: string, memeId: string, userId: string): Promise<Vote | null> {
  try {
    // Begin a transaction
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('battle_id', battleId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingVote) {
      console.log('User has already voted in this battle');
      return {
        id: existingVote.id,
        userId: existingVote.user_id,
        battleId: existingVote.battle_id,
        memeId: existingVote.meme_id,
        createdAt: new Date(existingVote.created_at)
      };
    }
    
    // Create a new vote
    const voteId = uuidv4();
    const { data: newVote, error: voteError } = await supabase
      .from('votes')
      .insert({
        id: voteId,
        battle_id: battleId,
        meme_id: memeId,
        user_id: userId
      })
      .select('*')
      .single();
    
    if (voteError) {
      console.error('Error creating vote:', voteError);
      return null;
    }
    
    // Increment the vote count for the meme
    // Fix: Use the supabase.rpc with the correct parameter format
    const { error: memeError } = await supabase.rpc(
      'increment_meme_votes', 
      { p_meme_id: memeId } as any
    );
    
    if (memeError) {
      console.error('Error incrementing meme votes:', memeError);
    }
    
    // Increment the battle vote count
    // Fix: Use the supabase.rpc with the correct parameter format
    const { error: battleError } = await supabase.rpc(
      'increment_battle_votes',
      { p_battle_id: battleId } as any
    );
    
    if (battleError) {
      console.error('Error incrementing battle votes:', battleError);
    }
    
    return {
      id: newVote.id,
      userId: newVote.user_id,
      battleId: newVote.battle_id,
      memeId: newVote.meme_id,
      createdAt: new Date(newVote.created_at)
    };
  } catch (error) {
    console.error('Error in castVote:', error);
    return null;
  }
}

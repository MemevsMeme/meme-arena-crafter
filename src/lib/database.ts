import { supabase } from './supabase';
import { User, Meme, Prompt, Battle, Vote, Database } from './types';

// User profiles
export async function getProfile(userId: string): Promise<User | null> {
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
    avatarUrl: data.avatar_url || '',
    memeStreak: data.meme_streak,
    wins: data.wins,
    losses: data.losses,
    level: data.level,
    xp: data.xp,
    createdAt: new Date(data.created_at)
  };
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  // Convert from our app model to database model
  const dbUpdates: any = {};
  if (updates.username !== undefined) dbUpdates.username = updates.username;
  if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
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
}

export async function createProfile(profile: Partial<User>): Promise<User | null> {
  const dbProfile: any = {
    id: profile.id,
    username: profile.username,
    avatar_url: profile.avatarUrl,
    meme_streak: profile.memeStreak || 0,
    wins: profile.wins || 0,
    losses: profile.losses || 0,
    level: profile.level || 1,
    xp: profile.xp || 0
  };
  
  const { data, error } = await supabase
    .from('profiles')
    .insert([dbProfile])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }
  
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
}

// Memes
export async function getMemes(limit = 10, offset = 0): Promise<Meme[]> {
  const { data, error } = await supabase
    .from('memes')
    .select(`
      *,
      creator:profiles(*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching memes:', error);
    return [];
  }
  
  return data.map((meme: any) => ({
    id: meme.id,
    prompt: meme.prompt,
    prompt_id: meme.prompt_id,
    imageUrl: meme.image_url,
    ipfsCid: meme.ipfs_cid || '',
    caption: meme.caption,
    creatorId: meme.creator_id,
    creator: meme.creator ? {
      id: meme.creator.id,
      username: meme.creator.username,
      avatarUrl: meme.creator.avatar_url || '',
      memeStreak: meme.creator.meme_streak,
      wins: meme.creator.wins,
      losses: meme.creator.losses,
      level: meme.creator.level,
      xp: meme.creator.xp,
      createdAt: new Date(meme.creator.created_at)
    } : undefined,
    votes: meme.votes,
    createdAt: new Date(meme.created_at),
    tags: meme.tags || []
  }));
}

export async function getMemesByUser(userId: string, limit = 10, offset = 0): Promise<Meme[]> {
  const { data, error } = await supabase
    .from('memes')
    .select(`
      *,
      creator:profiles(*)
    `)
    .eq('creator_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching memes:', error);
    return [];
  }
  
  return data as Meme[];
}

export async function createMeme(meme: Partial<Meme>): Promise<Meme | null> {
  const dbMeme: any = {
    prompt: meme.prompt,
    prompt_id: meme.prompt_id,
    image_url: meme.imageUrl,
    ipfs_cid: meme.ipfsCid,
    caption: meme.caption,
    creator_id: meme.creatorId,
    votes: meme.votes || 0,
    created_at: meme.createdAt ? meme.createdAt.toISOString() : new Date().toISOString(),
    tags: meme.tags || []
  };
  
  const { data, error } = await supabase
    .from('memes')
    .insert([dbMeme])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating meme:', error);
    return null;
  }
  
  return {
    id: data.id,
    prompt: data.prompt,
    prompt_id: data.prompt_id,
    imageUrl: data.image_url,
    ipfsCid: data.ipfs_cid || '',
    caption: data.caption,
    creatorId: data.creator_id,
    votes: data.votes,
    createdAt: new Date(data.created_at),
    tags: data.tags || []
  };
}

// Prompts
export async function getActivePrompt(): Promise<Prompt | null> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('active', true)
    .order('start_date', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching active prompt:', error);
    return null;
  }
  
  return data as Prompt;
}

export async function getPrompts(limit = 10, offset = 0): Promise<Prompt[]> {
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .order('start_date', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching prompts:', error);
    return [];
  }
  
  return data as Prompt[];
}

// Battles
export async function getActiveBattles(limit = 10, offset = 0): Promise<Battle[]> {
  const { data, error } = await supabase
    .from('battles')
    .select(`
      *,
      meme_one:memes!meme_one_id(*),
      meme_two:memes!meme_two_id(*),
      prompt:prompts(*)
    `)
    .eq('status', 'active')
    .order('start_time', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('Error fetching active battles:', error);
    return [];
  }
  
  return data as Battle[];
}

export async function getBattle(battleId: string): Promise<Battle | null> {
  const { data, error } = await supabase
    .from('battles')
    .select(`
      *,
      meme_one:memes!meme_one_id(*),
      meme_two:memes!meme_two_id(*),
      prompt:prompts(*)
    `)
    .eq('id', battleId)
    .single();
  
  if (error) {
    console.error('Error fetching battle:', error);
    return null;
  }
  
  return data as Battle;
}

// Votes
export async function createVote(vote: Partial<Vote>): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .insert([vote])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating vote:', error);
    return null;
  }
  
  return data as Vote;
}

export async function getUserVoteForBattle(userId: string, battleId: string): Promise<Vote | null> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .eq('battle_id', battleId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No vote found
      return null;
    }
    console.error('Error fetching user vote:', error);
    return null;
  }
  
  return data as Vote;
}

export async function getVoteCountForBattle(battleId: string): Promise<number> {
  const { count, error } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('battle_id', battleId);
  
  if (error) {
    console.error('Error fetching vote count:', error);
    return 0;
  }
  
  return count || 0;
}

// Convert database battle to app model
function mapBattleFromDb(battle: any): Battle {
  return {
    id: battle.id,
    promptId: battle.prompt_id || '',
    prompt: battle.prompt ? {
      id: battle.prompt.id,
      text: battle.prompt.text,
      theme: battle.prompt.theme || '',
      tags: battle.prompt.tags || [],
      active: battle.prompt.active,
      startDate: new Date(battle.prompt.start_date),
      endDate: new Date(battle.prompt.end_date)
    } : undefined,
    memeOneId: battle.meme_one_id,
    memeTwoId: battle.meme_two_id,
    memeOne: battle.meme_one ? mapMemeFromDb(battle.meme_one) : undefined,
    memeTwo: battle.meme_two ? mapMemeFromDb(battle.meme_two) : undefined,
    winnerId: battle.winner_id || undefined,
    voteCount: battle.vote_count,
    startTime: new Date(battle.start_time),
    endTime: new Date(battle.end_time),
    status: battle.status as 'active' | 'completed' | 'cancelled'
  };
}

// Convert database meme to app model
function mapMemeFromDb(meme: any): Meme {
  return {
    id: meme.id,
    prompt: meme.prompt || '',
    prompt_id: meme.prompt_id,
    imageUrl: meme.image_url,
    ipfsCid: meme.ipfs_cid || '',
    caption: meme.caption,
    creatorId: meme.creator_id,
    votes: meme.votes,
    createdAt: new Date(meme.created_at),
    tags: meme.tags || []
  };
}

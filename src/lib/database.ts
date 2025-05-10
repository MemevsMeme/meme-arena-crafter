
import { supabase } from './supabase';
import { User, Meme, Prompt, Battle, Vote } from './types';

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
  
  return data as User;
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  
  return data as User;
}

export async function createProfile(profile: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating profile:', error);
    return null;
  }
  
  return data as User;
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
  
  return data as Meme[];
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
  const { data, error } = await supabase
    .from('memes')
    .insert([meme])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating meme:', error);
    return null;
  }
  
  return data as Meme;
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

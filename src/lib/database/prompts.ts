
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from './types';
import { getFallbackChallenge } from '../challenges/index';

// Helper function to get current day of year
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
      .maybeSingle();
    
    if (challengeError || !challengeData) {
      console.error('Error fetching daily challenge:', challengeError);
      console.log('Using fallback challenge from local files');
      const fallback = getFallbackChallenge();
      return fallback;
    }
    
    // Return the challenge from the database
    return {
      id: challengeData.id,
      text: challengeData.text,
      theme: challengeData.theme || '',
      tags: challengeData.tags || [],
      active: true,
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 86400000), // 1 day later
      description: undefined,
      challengeDay: challengeData.day_of_year
    };
  } catch (error) {
    console.error('Error in getDailyChallenge:', error);
    // Return a fallback challenge from our local files
    return getFallbackChallenge();
  }
}

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

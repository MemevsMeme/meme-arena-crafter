
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from './types';

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

    if (error || !data) {
      console.error('Error fetching prompt:', error);
      return null;
    }

    return {
      id: data.id,
      text: data.text,
      theme: data.theme,
      tags: data.tags || [],
      active: data.active,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      description: data.description,
      creator_id: data.creator_id,
      is_community: data.is_community,
      daily_challenge_id: data.daily_challenge_id
    };
  } catch (error) {
    console.error('Unexpected error fetching prompt:', error);
    return null;
  }
}

/**
 * Get all prompts
 */
export async function getPrompts(): Promise<Prompt[]> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      console.error('Error fetching prompts:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      text: item.text,
      theme: item.theme,
      tags: item.tags || [],
      active: item.active,
      startDate: new Date(item.start_date),
      endDate: new Date(item.end_date),
      description: item.description,
      creator_id: item.creator_id,
      is_community: item.is_community,
      daily_challenge_id: item.daily_challenge_id
    }));
  } catch (error) {
    console.error('Unexpected error fetching prompts:', error);
    return [];
  }
}

/**
 * Create a new prompt
 */
export async function createPrompt(prompt: Partial<Prompt>): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert({
        text: prompt.text,
        theme: prompt.theme,
        tags: prompt.tags || [],
        active: prompt.active || false,
        start_date: prompt.startDate ? prompt.startDate.toISOString() : new Date().toISOString(),
        end_date: prompt.endDate ? prompt.endDate.toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        description: prompt.description,
        creator_id: prompt.creator_id,
        is_community: prompt.is_community
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error creating prompt:', error);
      return null;
    }

    return {
      id: data.id,
      text: data.text,
      theme: data.theme,
      tags: data.tags || [],
      active: data.active,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      description: data.description,
      creator_id: data.creator_id,
      is_community: data.is_community,
      daily_challenge_id: data.daily_challenge_id
    };
  } catch (error) {
    console.error('Unexpected error creating prompt:', error);
    return null;
  }
}

// Import castVote function from the votes module
export { castVote } from './database/votes';

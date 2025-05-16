
import { supabase } from '@/integrations/supabase/client';
import { Prompt } from '../types';

/**
 * Get the current day of the year (1-366)
 */
export function getCurrentDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

/**
 * Get a daily challenge by day of year
 * @param dayOfYear 
 */
export async function getDailyChallenge(dayOfYear: number): Promise<Prompt | null> {
  try {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('day_of_year', dayOfYear)
      .single();

    if (error) {
      console.error('Error fetching daily prompt:', error);
      return null;
    }

    if (!data) {
      console.log('No daily prompt found for day:', dayOfYear);
      return null;
    }

    // Map database fields to frontend model fields
    const prompt: Prompt = {
      id: data.id,
      text: data.text,
      theme: data.theme || null,
      tags: data.tags || [],
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    return prompt;
  } catch (error) {
    console.error('Unexpected error fetching daily prompt:', error);
    return null;
  }
}


import { supabase } from './supabase';
import { Prompt } from './types';

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


// Import the correct functions from the database module
import { getDailyChallenge, getCurrentDayOfYear } from './database';
import { Prompt } from './types';

/**
 * Get today's challenge for display
 */
export async function getTodaysChallenge(): Promise<Prompt | null> {
  // Get the current day of year
  const dayOfYear = getCurrentDayOfYear();
  
  // Fetch the challenge for today
  const challenge = await getDailyChallenge(dayOfYear);
  
  return challenge;
}

/**
 * Get a fallback challenge when no daily challenge is available
 */
export function getFallbackChallenge(): Prompt {
  // Return a default prompt when no database prompt is available
  return {
    id: 'fallback-1',
    text: 'Create a meme about coding frustrations',
    theme: 'tech',
    tags: ['coding', 'tech', 'funny'],
    active: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    description: 'When the code just won\'t work',
    creatorId: 'system',
    isCommunity: false,
    dailyChallengeId: 'fallback'
  };
}

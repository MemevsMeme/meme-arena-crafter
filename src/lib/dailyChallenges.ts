
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

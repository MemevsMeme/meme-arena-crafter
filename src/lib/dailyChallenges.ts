
// Import the correct functions from the database module
import { getDailyChallenge, getCurrentDayOfYear } from './database';
import { Prompt } from './types';

/**
 * Get today's challenge for display
 */
export async function getTodaysChallenge(): Promise<Prompt | null> {
  try {
    // Get the current day of year
    const dayOfYear = getCurrentDayOfYear();
    
    // Fetch the challenge for today
    const challenge = await getDailyChallenge(dayOfYear);
    
    // If no challenge is found, return null
    // The UI will handle displaying an appropriate message
    return challenge;
  } catch (error) {
    console.error('Error retrieving today\'s challenge:', error);
    return null;
  }
}

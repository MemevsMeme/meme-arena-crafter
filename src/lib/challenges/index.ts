
// Export all monthly challenges
import { januaryChallenges } from './january';
import { februaryChallenges } from './february';
import { marchChallenges } from './march';
import { aprilChallenges } from './april';
import { mayChallenges } from './may';
import { juneChallenges } from './june';
import { Prompt } from '../types';

// Combine all monthly challenges into a single array
export const DAILY_CHALLENGES: Prompt[] = [
  ...januaryChallenges,
  ...februaryChallenges,
  ...marchChallenges,
  ...aprilChallenges,
  ...mayChallenges,
  ...juneChallenges,
];

/**
 * Helper function to get the current day of the year
 * This is duplicated here to avoid circular imports
 */
function getCurrentDayOfYearLocal(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

/**
 * Gets a fallback challenge in case the database query fails
 * @returns A default Prompt object
 */
export function getFallbackChallenge(): Prompt {
  const dayOfYear = getCurrentDayOfYearLocal();
  
  // Use modulo to cycle through challenges if we have fewer than 365
  const index = dayOfYear % DAILY_CHALLENGES.length;
  
  return DAILY_CHALLENGES[index];
}

/**
 * Gets today's challenge using the current date
 * @returns The challenge for today
 */
export function getTodaysChallenge(): Prompt {
  // This is now a simplified function that just returns the fallback
  // In the app, we'll use the database function directly
  return getFallbackChallenge();
}

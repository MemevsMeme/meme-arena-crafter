
// Export all monthly challenges
import { januaryChallenges } from './january';
import { februaryChallenges } from './february';
import { marchChallenges } from './march';
import { aprilChallenges } from './april';
import { mayChallenges } from './may';
import { juneChallenges } from './june';
import { Prompt } from '../types';
import { getCurrentDayOfYear, getDailyChallenge } from '../database';

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
 * Gets a fallback challenge in case the database query fails
 * @returns A default Prompt object
 */
export function getFallbackChallenge(): Prompt {
  const today = new Date();
  // The getCurrentDayOfYear function doesn't take any arguments
  const dayOfYear = getCurrentDayOfYear();
  
  // Use modulo to cycle through challenges if we have fewer than 365
  const index = dayOfYear % DAILY_CHALLENGES.length;
  
  return DAILY_CHALLENGES[index];
}

/**
 * Gets today's challenge using the current date
 * @returns The challenge for today
 */
export function getTodaysChallenge(): Prompt {
  // This is a simple implementation that just returns the fallback
  // In a real app, we might query a database first
  return getFallbackChallenge();
}

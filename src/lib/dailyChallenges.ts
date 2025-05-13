import { Prompt } from './types';
import { getDailyChallenge, getCurrentDayOfYear } from './database';

// Static list of fallback challenges
const FALLBACK_CHALLENGES = [
  {
    text: 'Surprise!',
    theme: 'Unexpected situations',
    tags: ['surprise', 'unexpected', 'funny']
  },
  {
    text: 'When you realize it\'s Monday',
    theme: 'Work life',
    tags: ['monday', 'work', 'relatable']
  },
  {
    text: 'Nailed it!',
    theme: 'Success and failure',
    tags: ['success', 'failure', 'ironic']
  },
  {
    text: 'I tried...',
    theme: 'Effort and outcome',
    tags: ['effort', 'outcome', 'disappointment']
  },
  {
    text: 'Is this real life?',
    theme: 'Existential questions',
    tags: ['existential', 'question', 'confused']
  },
  {
    text: 'Adulting is hard',
    theme: 'Challenges of adulthood',
    tags: ['adulting', 'struggle', 'relatable']
  },
  {
    text: 'Why?',
    theme: 'Puzzlement and questioning',
    tags: ['why', 'questioning', 'confused']
  },
  {
    text: 'Expectation vs. Reality',
    theme: 'Discrepancies',
    tags: ['expectation', 'reality', 'funny']
  },
  {
    text: 'Procrastination level: Expert',
    theme: 'Procrastination',
    tags: ['procrastination', 'expert', 'lazy']
  },
  {
    text: 'First time?',
    theme: 'New experiences',
    tags: ['first time', 'experience', 'newbie']
  }
];

// Function to get today's challenge based on day of year
export async function getTodaysChallenge(): Promise<Prompt> {
  // First try to get the challenge from the database
  try {
    const dbChallenge = await getDailyChallenge();
    
    if (dbChallenge) {
      console.log('Found daily challenge in database:', dbChallenge.text);
      return dbChallenge;
    }
  } catch (error) {
    console.error('Error getting daily challenge from DB:', error);
  }
  
  // Fallback to local challenges if database fails
  return getFallbackChallenge();
}

// Get a fallback challenge based on the current day of the year
export function getFallbackChallenge(): Prompt {
  const dayOfYear = getCurrentDayOfYear();
  const index = dayOfYear % FALLBACK_CHALLENGES.length;
  const challenge = FALLBACK_CHALLENGES[index];
  
  // Format as a Prompt object
  return {
    id: `fallback-${dayOfYear}`,
    text: challenge.text,
    theme: challenge.theme || '',
    tags: challenge.tags || [],
    active: true,
    startDate: new Date(),
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    challengeDay: dayOfYear,
    is_community: false
  };
}


// Re-export all database functions from modules
import { v4 as uuidv4 } from 'uuid';

// Re-export types
export * from './types';

// Profiles
export { 
  getProfile, 
  updateProfile, 
  createProfile 
} from './profiles';

// Memes
export { 
  createMeme, 
  getMemeById, 
  getMemesByUserId,
  getTrendingMemes,
  getNewestMemes
} from './memes';

// Prompts
export { 
  getCurrentDayOfYear,
  getDailyChallenge,
  getActivePrompt,
  getPromptById,
  getPrompts,
  createPrompt
} from './prompts';

// Battles
export {
  getActiveBattles,
  getBattleById,
  castVote
} from './battles';

// Export UUID function for convenience
export { uuidv4 };

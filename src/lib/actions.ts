
import { updateProfile } from './database';

/**
 * Update a user's meme streak
 */
export async function updateMemeStreak(userId: string): Promise<boolean> {
  try {
    // Get the current profile
    const currentProfile = await updateProfile(userId, {
      memeStreak: 1 // Will be incremented by the database function
    });
    
    return !!currentProfile;
  } catch (error) {
    console.error('Error updating meme streak:', error);
    return false;
  }
}

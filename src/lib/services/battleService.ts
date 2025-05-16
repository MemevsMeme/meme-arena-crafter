
import { createBattlesForPrompt, completeBattlesAndDetermineWinners } from '../database/battles';

/**
 * Check for potential battles based on a new meme submission
 * @param promptId The prompt ID to check for battles
 */
export async function checkForBattles(promptId: string | null): Promise<void> {
  if (!promptId) {
    console.log('No promptId provided, skipping battle check');
    return;
  }
  
  try {
    console.log(`Checking for potential battles for prompt ID: ${promptId}`);
    await createBattlesForPrompt(promptId);
  } catch (error) {
    console.error('Error checking for battles:', error);
  }
}

/**
 * Run maintenance on battles (complete ended battles, etc.)
 */
export async function runBattleMaintenance(): Promise<void> {
  try {
    console.log('Running battle maintenance...');
    await completeBattlesAndDetermineWinners();
  } catch (error) {
    console.error('Error running battle maintenance:', error);
  }
}

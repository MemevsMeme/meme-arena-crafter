
import { supabase } from '@/integrations/supabase/client';
import { Vote } from '../types';

/**
 * Cast a vote for a meme in a battle
 * @param userId 
 * @param battleId 
 * @param memeId 
 */
export async function castVote(userId: string, battleId: string, memeId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('votes')
      .insert({
        user_id: userId,
        battle_id: battleId,
        meme_id: memeId
      });

    if (error) {
      console.error('Error casting vote:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error casting vote:', error);
    return false;
  }
}

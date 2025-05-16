
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
    // Check if user has already voted in this battle
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('battle_id', battleId)
      .single();

    if (existingVote) {
      console.log('User has already voted in this battle');
      return false;
    }

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

    // Increment battle vote count
    await incrementBattleVote(memeId, battleId);
    
    return true;
  } catch (error) {
    console.error('Unexpected error casting vote:', error);
    return false;
  }
}

/**
 * Check if a user has already voted in a battle
 * @param userId 
 * @param battleId 
 */
export async function hasUserVotedInBattle(userId: string, battleId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('user_id', userId)
      .eq('battle_id', battleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, user hasn't voted
        return false;
      }
      console.error('Error checking if user voted:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Unexpected error checking if user voted:', error);
    return false;
  }
}

/**
 * Get all votes for a battle
 * @param battleId 
 */
export async function getBattleVotes(battleId: string): Promise<Vote[]> {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('battle_id', battleId);

    if (error) {
      console.error('Error fetching battle votes:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map(vote => ({
      id: vote.id,
      userId: vote.user_id,
      battleId: vote.battle_id,
      memeId: vote.meme_id,
      createdAt: new Date(vote.created_at)
    }));
  } catch (error) {
    console.error('Unexpected error fetching battle votes:', error);
    return [];
  }
}

/**
 * Increment the vote count for a meme in a battle
 * @param memeId 
 * @param battleId 
 */
export async function incrementBattleVote(memeId: string, battleId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('increment_battle_vote', {
      meme_id: memeId,
      battle_id: battleId
    });
    
    if (error) {
      console.error('Error incrementing battle vote:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error incrementing battle vote:', error);
    return false;
  }
}

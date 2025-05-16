
import { supabase } from './client';
import { Battle } from '../types';

/**
 * Get active battles
 * @param count 
 * @param offset 
 * @param status 'active' | 'completed' | 'all'
 */
export async function getActiveBattles(count: number = 10, offset: number = 0, status: 'active' | 'completed' | 'all' = 'active'): Promise<Battle[]> {
  try {
    let query = supabase
      .from('battles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + count - 1);

    if (status === 'active') {
      query = query.eq('status', 'active');
    } else if (status === 'completed') {
      query = query.eq('status', 'completed');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching battles:', error);
      return [];
    }

    if (!data) {
      console.log('No battles found');
      return [];
    }

    return data.map(mapBattle);
  } catch (error) {
    console.error('Unexpected error fetching battles:', error);
    return [];
  }
}

/**
 * Get battle by ID
 * @param battleId 
 */
export async function getBattleById(battleId: string): Promise<Battle | null> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();

    if (error) {
      console.error('Error fetching battle:', error);
      return null;
    }

    if (!data) {
      console.log('No battle found with id:', battleId);
      return null;
    }

    return mapBattle(data);
  } catch (error) {
    console.error('Unexpected error fetching battle:', error);
    return null;
  }
}

/**
 * Insert a new battle
 * @param battle 
 */
export async function insertBattle(battle: Omit<Battle, 'id' | 'createdAt' | 'status' | 'votes_a' | 'votes_b' | 'meme_one_id' | 'meme_two_id'>): Promise<Battle | null> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .insert({
        prompt: battle.prompt,
        prompt_id: battle.promptId,
        creator_id: battle.creator_id,
        start_time: battle.startTime?.toISOString(),
        end_time: battle.endTime?.toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error inserting battle:', error);
      return null;
    }

    if (!data) {
      console.log('Failed to insert battle');
      return null;
    }

    return mapBattle(data);
  } catch (error) {
    console.error('Unexpected error inserting battle:', error);
    return null;
  }
}

/**
 * Update a battle
 * @param battleId 
 * @param battle 
 */
export async function updateBattle(battleId: string, battle: Partial<Battle>): Promise<Battle | null> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .update({
        prompt: battle.prompt,
        prompt_id: battle.promptId,
        creator_id: battle.creator_id,
        start_time: battle.startTime?.toISOString(),
        end_time: battle.endTime?.toISOString(),
        status: battle.status,
        votes_a: battle.votes_a,
        votes_b: battle.votes_b,
        meme_one_id: battle.meme_one_id,
        meme_two_id: battle.meme_two_id,
      })
      .eq('id', battleId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating battle:', error);
      return null;
    }

    if (!data) {
      console.log('Battle not found with id:', battleId);
      return null;
    }

    return mapBattle(data);
  } catch (error) {
    console.error('Unexpected error updating battle:', error);
    return null;
  }
}

/**
 * Delete a battle
 * @param battleId 
 */
export async function deleteBattle(battleId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('battles')
      .delete()
      .eq('id', battleId);

    if (error) {
      console.error('Error deleting battle:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting battle:', error);
    return false;
  }
}

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

// Map database fields to frontend model fields
function mapBattle(data: any): Battle {
  return {
    id: data.id,
    promptId: data.prompt_id || null,
    prompt: data.prompt || '',
    creator_id: data.creator_id || '',
    startTime: new Date(data.start_time),
    endTime: new Date(data.end_time),
    status: data.status || 'active',
    votes_a: data.votes_a || 0,
    votes_b: data.votes_b || 0,
    meme_one_id: data.meme_one_id || null,
    meme_two_id: data.meme_two_id || null,
    voteCount: data.vote_count || 0,
    memeOneId: data.meme_one_id,
    memeTwoId: data.meme_two_id,
    winnerId: data.winner_id,
    is_community: data.is_community,
    createdAt: new Date(data.created_at)
  };
}

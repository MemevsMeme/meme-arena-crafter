
import { supabase } from '@/integrations/supabase/client';
import { Battle, Meme } from '../types';
import { getMemesByPromptId } from './memes';

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
      .order('start_time', { ascending: false })
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
        prompt_id: battle.promptId,
        meme_one_id: battle.memeOneId,
        meme_two_id: battle.memeTwoId,
        creator_id: battle.creator_id,
        start_time: battle.startTime?.toISOString(),
        end_time: battle.endTime?.toISOString(),
        status: 'active'
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
        prompt_id: battle.promptId,
        creator_id: battle.creator_id,
        start_time: battle.startTime?.toISOString(),
        end_time: battle.endTime?.toISOString(),
        status: battle.status,
        votes_a: battle.votes_a,
        votes_b: battle.votes_b,
        meme_one_id: battle.meme_one_id,
        meme_two_id: battle.meme_two_id,
        winner_id: battle.winnerId
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
    // Fix TypeScript errors by using a type assertion
    const { error } = await supabase.rpc(
      'increment_battle_vote' as any, 
      {
        meme_id: memeId,
        battle_id: battleId
      }
    );
    
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

/**
 * Find and create battles for memes with the same prompt ID
 * @param promptId 
 */
export async function createBattlesForPrompt(promptId: string): Promise<Battle[]> {
  try {
    // Get all memes with this prompt ID
    const memes = await getMemesByPromptId(promptId);
    
    if (memes.length < 2) {
      console.log('Not enough memes for a battle');
      return [];
    }
    
    // Check if battles already exist for this prompt
    const { data: existingBattles, error: battlesError } = await supabase
      .from('battles')
      .select('*')
      .eq('prompt_id', promptId);
      
    if (battlesError) {
      console.error('Error checking existing battles:', battlesError);
      return [];
    }
    
    // If battles already exist, return them
    if (existingBattles && existingBattles.length > 0) {
      return existingBattles.map(mapBattle);
    }
    
    // Sort memes by votes
    const sortedMemes = [...memes].sort((a, b) => b.votes - a.votes);
    
    // Get the top two memes
    const topTwo = sortedMemes.slice(0, 2);
    
    if (topTwo.length !== 2) {
      console.log('Not enough memes for a battle after sorting');
      return [];
    }
    
    // Create a battle with the top two memes
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3); // Battle runs for 3 days
    
    const battle = await insertBattle({
      promptId,
      memeOneId: topTwo[0].id,
      memeTwoId: topTwo[1].id,
      voteCount: 0,
      startTime: new Date(),
      endTime: endDate,
      creator_id: 'system'
    });
    
    if (!battle) {
      console.error('Failed to create battle');
      return [];
    }
    
    return [battle];
  } catch (error) {
    console.error('Unexpected error creating battles for prompt:', error);
    return [];
  }
}

export async function getBattlesByPromptId(promptId: string): Promise<Battle[]> {
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('prompt_id', promptId)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching battles by prompt ID:', error);
      return [];
    }

    if (!data) {
      console.log('No battles found for prompt ID:', promptId);
      return [];
    }

    return data.map(mapBattle);
  } catch (error) {
    console.error('Unexpected error fetching battles by prompt ID:', error);
    return [];
  }
}

/**
 * Complete battles that have ended and determine winners
 */
export async function completeBattlesAndDetermineWinners(): Promise<boolean> {
  try {
    // Find active battles that have ended
    const now = new Date().toISOString();
    const { data: endedBattles, error } = await supabase
      .from('battles')
      .select('*')
      .eq('status', 'active')
      .lt('end_time', now);
      
    if (error) {
      console.error('Error finding ended battles:', error);
      return false;
    }
    
    if (!endedBattles || endedBattles.length === 0) {
      console.log('No battles to complete');
      return true;
    }
    
    // Process each ended battle
    for (const battle of endedBattles) {
      // Get votes for meme one and meme two
      const { data: voteData, error: voteError } = await supabase
        .from('votes')
        .select('meme_id')
        .eq('battle_id', battle.id);
        
      if (voteError) {
        console.error('Error getting votes for battle:', battle.id, voteError);
        continue;
      }
      
      if (!voteData) {
        console.log('No votes found for battle:', battle.id);
        continue;
      }
      
      // Count votes for each meme
      const memeOneVotes = voteData.filter(v => v.meme_id === battle.meme_one_id).length;
      const memeTwoVotes = voteData.filter(v => v.meme_id === battle.meme_two_id).length;
      
      // Determine winner
      let winnerId = null;
      if (memeOneVotes > memeTwoVotes) {
        winnerId = battle.meme_one_id;
      } else if (memeTwoVotes > memeOneVotes) {
        winnerId = battle.meme_two_id;
      } else {
        // Tie, no winner
        winnerId = null;
      }
      
      // Update battle
      await updateBattle(battle.id, {
        status: 'completed',
        winnerId,
        votes_a: memeOneVotes,
        votes_b: memeTwoVotes
      });
      
      // Update creator stats if there's a winner
      if (winnerId) {
        // Get the winning meme's creator
        const { data: winnerMeme, error: winnerError } = await supabase
          .from('memes')
          .select('creator_id')
          .eq('id', winnerId)
          .single();
          
        if (winnerError || !winnerMeme) {
          console.error('Error getting winning meme:', winnerError);
          continue;
        }
        
        // Get the losing meme's creator
        const losingId = winnerId === battle.meme_one_id ? battle.meme_two_id : battle.meme_one_id;
        const { data: loserMeme, error: loserError } = await supabase
          .from('memes')
          .select('creator_id')
          .eq('id', losingId)
          .single();
          
        if (loserError || !loserMeme) {
          console.error('Error getting losing meme:', loserError);
          continue;
        }
        
        // Fix TypeScript errors by using type assertions
        await supabase.rpc(
          'increment_user_wins' as any, 
          { 
            user_id: winnerMeme.creator_id 
          }
        );
        
        // Fix TypeScript errors by using type assertions
        await supabase.rpc(
          'increment_user_losses' as any, 
          { 
            user_id: loserMeme.creator_id 
          }
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('Unexpected error completing battles:', error);
    return false;
  }
}

// Map database fields to frontend model fields
function mapBattle(data: any): Battle {
  return {
    id: data.id,
    promptId: data.prompt_id || null,
    prompt: data.prompt_id ? data.prompt : data.prompt || '',
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
    createdAt: new Date(data.created_at || data.start_time)
  };
}

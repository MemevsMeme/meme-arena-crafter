
import { supabase } from '@/integrations/supabase/client';
import { Battle, Vote, Meme, RpcParams } from './types';
import { v4 as uuidv4 } from 'uuid';

export async function getActiveBattles(limit: number = 10, offset: number = 0, filter: 'all' | 'official' | 'community' = 'all'): Promise<Battle[]> {
  try {
    // First get the battles
    let query = supabase
      .from('battles')
      .select('*')
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (filter === 'official') {
      query = query.eq('is_community', false);
    } else if (filter === 'community') {
      query = query.eq('is_community', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching active battles:', error);
      return [];
    }
    
    // Now build the full battle objects with related data
    const battles = await Promise.all(data.map(async (b) => {
      // Get meme one
      const { data: memeOneData, error: memeOneError } = b.meme_one_id ? await supabase
        .from('memes')
        .select('*')
        .eq('id', b.meme_one_id)
        .maybeSingle() : { data: null, error: null };
      
      // Get meme two
      const { data: memeTwoData, error: memeTwoError } = b.meme_two_id ? await supabase
        .from('memes')
        .select('*')
        .eq('id', b.meme_two_id)
        .maybeSingle() : { data: null, error: null };
      
      // Get prompt if available
      let promptData = null;
      if (b.prompt_id) {
        const { data: prompt, error: promptError } = await supabase
          .from('prompts')
          .select('*')
          .eq('id', b.prompt_id)
          .maybeSingle();
        
        if (!promptError && prompt) {
          promptData = prompt;
        }
      }
      
      // Build the battle object
      return {
        id: b.id,
        promptId: b.prompt_id || '',
        prompt: promptData ? {
          id: promptData.id,
          text: promptData.text,
          theme: promptData.theme || '',
          tags: promptData.tags || [],
          active: promptData.active,
          startDate: new Date(promptData.start_date),
          endDate: new Date(promptData.end_date),
          description: promptData.description || undefined,
          creator_id: promptData.creator_id || undefined,
          is_community: promptData.is_community || false
        } : undefined,
        memeOneId: b.meme_one_id,
        memeTwoId: b.meme_two_id,
        memeOne: !memeOneError && memeOneData ? {
          id: memeOneData.id,
          prompt: memeOneData.prompt || '',
          prompt_id: memeOneData.prompt_id || undefined,
          imageUrl: memeOneData.image_url,
          ipfsCid: memeOneData.ipfs_cid || '',
          caption: memeOneData.caption,
          creatorId: memeOneData.creator_id,
          votes: memeOneData.votes || 0,
          createdAt: new Date(memeOneData.created_at),
          tags: memeOneData.tags || []
        } : undefined,
        memeTwo: !memeTwoError && memeTwoData ? {
          id: memeTwoData.id,
          prompt: memeTwoData.prompt || '',
          prompt_id: memeTwoData.prompt_id || undefined,
          imageUrl: memeTwoData.image_url,
          ipfsCid: memeTwoData.ipfs_cid || '',
          caption: memeTwoData.caption,
          creatorId: memeTwoData.creator_id,
          votes: memeTwoData.votes || 0,
          createdAt: new Date(memeTwoData.created_at),
          tags: memeTwoData.tags || []
        } : undefined,
        winnerId: b.winner_id || undefined,
        voteCount: b.vote_count || 0,
        startTime: new Date(b.start_time),
        endTime: new Date(b.end_time),
        status: b.status as 'active' | 'completed' | 'cancelled',
        is_community: b.is_community || false,
        creator_id: b.creator_id || undefined
      };
    }));
    
    return battles;
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
}

export async function getBattleById(battleId: string): Promise<Battle | null> {
  try {
    // Get the battle
    const { data: battleData, error: battleError } = await supabase
      .from('battles')
      .select('*')
      .eq('id', battleId)
      .single();
    
    if (battleError || !battleData) {
      console.error('Error fetching battle by ID:', battleError);
      return null;
    }
    
    // Get meme one
    const { data: memeOneData, error: memeOneError } = battleData.meme_one_id ? await supabase
      .from('memes')
      .select('*')
      .eq('id', battleData.meme_one_id)
      .maybeSingle() : { data: null, error: null };
    
    // Get meme two
    const { data: memeTwoData, error: memeTwoError } = battleData.meme_two_id ? await supabase
      .from('memes')
      .select('*')
      .eq('id', battleData.meme_two_id)
      .maybeSingle() : { data: null, error: null };
    
    return {
      id: battleData.id,
      promptId: battleData.prompt_id || '',
      memeOneId: battleData.meme_one_id,
      memeTwoId: battleData.meme_two_id,
      memeOne: !memeOneError && memeOneData ? {
        id: memeOneData.id,
        prompt: memeOneData.prompt || '',
        prompt_id: memeOneData.prompt_id || undefined,
        imageUrl: memeOneData.image_url,
        ipfsCid: memeOneData.ipfs_cid || '',
        caption: memeOneData.caption,
        creatorId: memeOneData.creator_id,
        votes: memeOneData.votes || 0,
        createdAt: new Date(memeOneData.created_at),
        tags: memeOneData.tags || []
      } : undefined,
      memeTwo: !memeTwoError && memeTwoData ? {
        id: memeTwoData.id,
        prompt: memeTwoData.prompt || '',
        prompt_id: memeTwoData.prompt_id || undefined,
        imageUrl: memeTwoData.image_url,
        ipfsCid: memeTwoData.ipfs_cid || '',
        caption: memeTwoData.caption,
        creatorId: memeTwoData.creator_id,
        votes: memeTwoData.votes || 0,
        createdAt: new Date(memeTwoData.created_at),
        tags: memeTwoData.tags || []
      } : undefined,
      winnerId: battleData.winner_id || undefined,
      voteCount: battleData.vote_count || 0,
      startTime: new Date(battleData.start_time),
      endTime: new Date(battleData.end_time),
      status: battleData.status as 'active' | 'completed' | 'cancelled',
      is_community: battleData.is_community || false,
      creator_id: battleData.creator_id || undefined
    };
  } catch (error) {
    console.error('Error in getBattleById:', error);
    return null;
  }
}

export async function castVote(battleId: string, memeId: string, userId: string): Promise<Vote | null> {
  try {
    // Begin a transaction
    const { data: existingVote, error: checkError } = await supabase
      .from('votes')
      .select('*')
      .eq('battle_id', battleId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (existingVote) {
      console.log('User has already voted in this battle');
      return {
        id: existingVote.id,
        userId: existingVote.user_id,
        battleId: existingVote.battle_id,
        memeId: existingVote.meme_id,
        createdAt: new Date(existingVote.created_at)
      };
    }
    
    // Create a new vote
    const voteId = uuidv4();
    const { data: newVote, error: voteError } = await supabase
      .from('votes')
      .insert({
        id: voteId,
        battle_id: battleId,
        meme_id: memeId,
        user_id: userId
      })
      .select('*')
      .single();
    
    if (voteError) {
      console.error('Error creating vote:', voteError);
      return null;
    }
    
    // Increment the vote count for the meme using RPC with proper typing
    const { error: memeError } = await supabase.rpc(
      'increment_meme_votes', 
      { p_meme_id: memeId }
    );
    
    if (memeError) {
      console.error('Error incrementing meme votes:', memeError);
    }
    
    // Increment the battle vote count using RPC with proper typing
    const { error: battleError } = await supabase.rpc(
      'increment_battle_votes',
      { p_battle_id: battleId }
    );
    
    if (battleError) {
      console.error('Error incrementing battle votes:', battleError);
    }
    
    return {
      id: newVote.id,
      userId: newVote.user_id,
      battleId: newVote.battle_id,
      memeId: newVote.meme_id,
      createdAt: new Date(newVote.created_at)
    };
  } catch (error) {
    console.error('Error in castVote:', error);
    return null;
  }
}

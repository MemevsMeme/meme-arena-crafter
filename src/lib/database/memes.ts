
import { supabase } from '@/integrations/supabase/client';
import { Meme } from './types';

export async function createMeme(meme: Partial<Meme>): Promise<Meme | null> {
  try {
    // Convert from our type to the DB schema
    const dbMeme = {
      prompt: meme.prompt || null,
      prompt_id: meme.prompt_id || null,
      image_url: meme.imageUrl,
      ipfs_cid: meme.ipfsCid || null,
      caption: meme.caption || '',
      creator_id: meme.creatorId,
      votes: meme.votes || 0,
      tags: meme.tags || [],
      battle_id: meme.battleId || null,
      is_battle_submission: meme.isBattleSubmission || false,
      challenge_day: meme.challengeDay || null
    };
    
    const { data, error } = await supabase
      .from('memes')
      .insert(dbMeme)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating meme:', error);
      return null;
    }
    
    return {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id || undefined,
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      votes: data.votes || 0,
      createdAt: new Date(data.created_at),
      tags: data.tags || [],
      isBattleSubmission: data.is_battle_submission || false,
      battleId: data.battle_id || undefined,
      challengeDay: data.challenge_day || undefined
    };
  } catch (error) {
    console.error('Error in createMeme:', error);
    return null;
  }
}

export async function getMemeById(memeId: string): Promise<Meme | null> {
  try {
    // First get the meme
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('id', memeId)
      .single();
    
    if (error) {
      console.error('Error fetching meme:', error);
      return null;
    }
    
    // Then get the creator if needed
    let creator;
    if (data.creator_id) {
      const { data: creatorData, error: creatorError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('id', data.creator_id)
        .maybeSingle();
        
      if (!creatorError && creatorData) {
        creator = {
          id: creatorData.id,
          username: creatorData.username,
          avatarUrl: creatorData.avatar_url || '',
          memeStreak: 0,
          wins: 0,
          losses: 0,
          level: 1,
          xp: 0,
          createdAt: new Date()
        };
      }
    }
    
    return {
      id: data.id,
      prompt: data.prompt || '',
      prompt_id: data.prompt_id || undefined,
      imageUrl: data.image_url,
      ipfsCid: data.ipfs_cid || '',
      caption: data.caption,
      creatorId: data.creator_id,
      creator: creator,
      votes: data.votes || 0,
      createdAt: new Date(data.created_at),
      tags: data.tags || [],
      isBattleSubmission: data.is_battle_submission || false,
      battleId: data.battle_id || undefined,
      challengeDay: data.challenge_day || undefined
    };
  } catch (error) {
    console.error('Error in getMemeById:', error);
    return null;
  }
}

export async function getMemesByUserId(userId: string): Promise<Meme[]> {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching memes by user ID:', error);
      return [];
    }
    
    return data.map(m => ({
      id: m.id,
      prompt: m.prompt || '',
      prompt_id: m.prompt_id || undefined,
      imageUrl: m.image_url,
      ipfsCid: m.ipfs_cid || '',
      caption: m.caption,
      creatorId: m.creator_id,
      votes: m.votes || 0,
      createdAt: new Date(m.created_at),
      tags: m.tags || [],
      isBattleSubmission: m.is_battle_submission || false,
      battleId: m.battle_id || undefined,
      challengeDay: m.challenge_day || undefined
    }));
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
}

export async function getTrendingMemes(limit: number = 10): Promise<Meme[]> {
  try {
    // Get memes first
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('votes', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching trending memes:', error);
      return [];
    }
    
    // Then get the creators for those memes
    const memes = await Promise.all(data.map(async (m) => {
      let creator;
      if (m.creator_id) {
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', m.creator_id)
          .maybeSingle();
          
        if (!creatorError && creatorData) {
          creator = {
            id: creatorData.id,
            username: creatorData.username,
            avatarUrl: creatorData.avatar_url || '',
            memeStreak: 0,
            wins: 0,
            losses: 0,
            level: 1,
            xp: 0,
            createdAt: new Date()
          };
        }
      }
      
      return {
        id: m.id,
        prompt: m.prompt || '',
        prompt_id: m.prompt_id || undefined,
        imageUrl: m.image_url,
        ipfsCid: m.ipfs_cid || '',
        caption: m.caption,
        creatorId: m.creator_id,
        creator: creator,
        votes: m.votes || 0,
        createdAt: new Date(m.created_at),
        tags: m.tags || [],
        isBattleSubmission: m.is_battle_submission || false,
        battleId: m.battle_id || undefined,
        challengeDay: m.challenge_day || undefined
      };
    }));
    
    return memes;
  } catch (error) {
    console.error('Error in getTrendingMemes:', error);
    return [];
  }
}

export async function getNewestMemes(limit: number = 10): Promise<Meme[]> {
  try {
    // Get memes first
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching newest memes:', error);
      return [];
    }
    
    // Then get the creators for those memes
    const memes = await Promise.all(data.map(async (m) => {
      let creator;
      if (m.creator_id) {
        const { data: creatorData, error: creatorError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .eq('id', m.creator_id)
          .maybeSingle();
          
        if (!creatorError && creatorData) {
          creator = {
            id: creatorData.id,
            username: creatorData.username,
            avatarUrl: creatorData.avatar_url || '',
            memeStreak: 0,
            wins: 0,
            losses: 0,
            level: 1,
            xp: 0,
            createdAt: new Date()
          };
        }
      }
      
      return {
        id: m.id,
        prompt: m.prompt || '',
        prompt_id: m.prompt_id || undefined,
        imageUrl: m.image_url,
        ipfsCid: m.ipfs_cid || '',
        caption: m.caption,
        creatorId: m.creator_id,
        creator: creator,
        votes: m.votes || 0,
        createdAt: new Date(m.created_at),
        tags: m.tags || [],
        isBattleSubmission: m.is_battle_submission || false,
        battleId: m.battle_id || undefined,
        challengeDay: m.challenge_day || undefined
      };
    }));
    
    return memes;
  } catch (error) {
    console.error('Error in getNewestMemes:', error);
    return [];
  }
}

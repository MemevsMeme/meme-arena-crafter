
import { supabase } from '@/integrations/supabase/client';
import { Caption, Meme, Prompt, Battle } from './types';

export const getActivePrompt = async (): Promise<Prompt | null> => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('date', formattedDate)
      .single();

    if (error) {
      console.error('Error fetching active prompt:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getActivePrompt:', error);
    return null;
  }
};

export const getProfile = async (userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
};

export const updateProfile = async (userId: string, updates: any): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
};

export const getMemesByUserId = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching memes by user ID:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMemesByUserId:', error);
    return [];
  }
};

export const createProfile = async (profile: {
  id: string;
  username: string;
  avatarUrl?: string;
}): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatarUrl,
        meme_streak: 0,
        wins: 0,
        losses: 0,
        level: 1,
        xp: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
};

export const getActiveBattles = async (limit: number = 20, offset: number = 0, filter: string = 'all'): Promise<Battle[]> => {
  try {
    let query = supabase
      .from('battles')
      .select('*, meme_one_id(*), meme_two_id(*)')
      .eq('status', 'active')
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (filter === 'community') {
      query = query.eq('is_community', true);
    } else if (filter === 'official') {
      query = query.eq('is_community', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching active battles:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getActiveBattles:', error);
    return [];
  }
};

export const getPrompts = async (limit: number = 10, offset: number = 0, isCommunity: boolean = false): Promise<Prompt[]> => {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('active', true)
      .eq('is_community', isCommunity)
      .order('start_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching prompts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPrompts:', error);
    return [];
  }
};

export const createMeme = async (meme: {
  prompt?: string;
  prompt_id?: string;
  imageUrl: string;
  ipfsCid?: string;
  caption: string;
  creatorId: string;
  votes: number;
  createdAt: Date;
  tags: string[];
}) => {
  console.log('Creating meme with data:', meme);

  try {
    // Convert the meme object to a database-friendly format
    const dbMeme = {
      prompt: meme.prompt,
      prompt_id: meme.prompt_id,
      image_url: meme.imageUrl, // Note the snake_case here
      ipfs_cid: meme.ipfsCid,
      caption: meme.caption,
      creator_id: meme.creatorId,
      votes: meme.votes,
      created_at: meme.createdAt.toISOString(),
      tags: meme.tags,
      // Add these default values to prevent database errors
      is_battle_submission: false,
      battle_id: null
    };

    console.log('Sending to database:', dbMeme);

    const { data, error } = await supabase
      .from('memes')
      .insert(dbMeme)
      .select()
      .single();

    if (error) {
      console.error('Error creating meme:', error);
      throw error;
    }

    console.log('Meme successfully saved to database:', data);
    
    // Transform the database response to match the expected format with camelCase properties
    const transformedData = {
      ...data,
      imageUrl: data.image_url,
      creatorId: data.creator_id,
      createdAt: new Date(data.created_at)
    };
    
    return transformedData;
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
}

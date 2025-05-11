import { supabase } from '@/integrations/supabase/client';
import { Caption } from './types';

export const getActivePrompt = async (): Promise<any | null> => {
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
      image_url: meme.imageUrl,
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
    return data;
  } catch (err) {
    console.error('Error creating meme record in database');
    throw new Error('Failed to create meme record');
  }
}

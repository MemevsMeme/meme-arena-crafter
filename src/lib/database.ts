
import { supabase } from '@/integrations/supabase/client';

export async function getMemes() {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*');
    
    if (error) {
      console.error('Error fetching memes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error getting memes:', error);
    return [];
  }
}

export async function getMemeById(id: string) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching meme by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting meme by ID:', error);
    return null;
  }
}

export async function createMeme(memeData: {
  prompt: string;
  prompt_id?: string | null;
  imageUrl: string;
  ipfsCid?: string;
  caption: string;
  creatorId: string;
  votes: number;
  createdAt: Date;
  tags: string[];
}) {
  console.log('Creating meme with data:', memeData);
  
  try {
    // Create a clean data object without undefined or invalid values
    // IMPORTANT: Convert camelCase to snake_case field names for Supabase
    const cleanData = {
      prompt: memeData.prompt,
      image_url: memeData.imageUrl, // Changed from imageUrl to image_url
      caption: memeData.caption,
      creator_id: memeData.creatorId,
      votes: memeData.votes || 0,
      created_at: memeData.createdAt.toISOString(), // Convert Date to ISO string for Postgres
      tags: memeData.tags || []
    };
    
    // Only add prompt_id if it's valid (not null or undefined)
    if (memeData.prompt_id) {
      Object.assign(cleanData, { prompt_id: memeData.prompt_id });
    }
    
    // Only add ipfsCid if it's valid
    if (memeData.ipfsCid) {
      Object.assign(cleanData, { ipfs_cid: memeData.ipfsCid });
    }
    
    // Insert the meme into the database
    const { data, error } = await supabase
      .from('memes')
      .insert(cleanData)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting meme:', error);
      throw new Error(`Failed to create meme record in database: ${error.message}`);
    }
    
    console.log('Meme inserted successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating meme:', error);
    throw error;
  }
}

export async function updateMeme(id: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating meme:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating meme:', error);
    return null;
  }
}

export async function deleteMeme(id: string) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting meme:', error);
      return false;
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting meme:', error);
    return false;
  }
}

// Implementation for stub functions to resolve build errors
export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting profile:', error);
    return null;
  }
}

export async function createProfile(profileData: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating profile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}

// Remaining stub functions with basic implementations
export async function getDailyChallenge() {
  console.warn('getDailyChallenge called but not fully implemented');
  return null;
}

export async function getCurrentDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

export async function getBattleById(id: string) {
  try {
    const { data, error } = await supabase
      .from('battles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching battle by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting battle by ID:', error);
    return null;
  }
}

export async function getPromptById(id: string) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching prompt by ID:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting prompt by ID:', error);
    return null;
  }
}

export async function castVote(battleId: string, memeId: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('votes')
      .insert({
        battle_id: battleId,
        meme_id: memeId,
        user_id: userId
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error casting vote:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error casting vote:', error);
    return null;
  }
}

export async function getActiveBattles(limit = 10, offset = 0, filter = 'all') {
  try {
    let query = supabase.from('battles').select('*');
    
    if (filter === 'active') {
      query = query.eq('status', 'active');
    } else if (filter === 'completed') {
      query = query.eq('status', 'completed');
    }
    
    query = query.order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching active battles:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error getting active battles:', error);
    return [];
  }
}

export async function getPrompts(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .limit(limit);
    
    if (error) {
      console.error('Error fetching prompts:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error getting prompts:', error);
    return [];
  }
}

export async function createPrompt(promptData: any) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .insert(promptData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating prompt:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating prompt:', error);
    return null;
  }
}

export async function getTrendingMemes(limit = 12) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('votes', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching trending memes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error getting trending memes:', error);
    return [];
  }
}

export async function getNewestMemes(limit = 12) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching newest memes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error getting newest memes:', error);
    return [];
  }
}

export async function getMemesByUserId(userId: string, limit = 12) {
  try {
    const { data, error } = await supabase
      .from('memes')
      .select('*')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching user memes:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user memes:', error);
    return [];
  }
}

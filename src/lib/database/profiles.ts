
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

// User profile functions
export async function getProfile(userId: string): Promise<User | null> {
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
    
    if (!data) return null;
    
    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      level: data.level || 1,
      xp: data.xp || 0,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    // Convert from our type to the DB schema
    const dbUpdates: any = {};
    
    if (updates.username) dbUpdates.username = updates.username;
    if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.memeStreak !== undefined) dbUpdates.meme_streak = updates.memeStreak;
    if (updates.wins !== undefined) dbUpdates.wins = updates.wins;
    if (updates.losses !== undefined) dbUpdates.losses = updates.losses;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    
    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', userId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      level: data.level || 1,
      xp: data.xp || 0,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
}

export async function createProfile(profile: Partial<User>): Promise<User | null> {
  try {
    if (!profile.id) {
      console.error('User ID is required to create a profile');
      return null;
    }
    
    // Convert to database schema
    const dbProfile = {
      id: profile.id,
      username: profile.username || `user_${profile.id.substring(0, 8)}`,
      avatar_url: profile.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${profile.id}`,
      meme_streak: profile.memeStreak || 0,
      wins: profile.wins || 0,
      losses: profile.losses || 0,
      level: profile.level || 1,
      xp: profile.xp || 0
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert(dbProfile)
      .select('*')
      .single();
    
    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }
    
    return {
      id: data.id,
      username: data.username,
      avatarUrl: data.avatar_url || '',
      memeStreak: data.meme_streak || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
      level: data.level || 1,
      xp: data.xp || 0,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in createProfile:', error);
    return null;
  }
}

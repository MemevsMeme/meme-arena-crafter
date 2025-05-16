
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';

/**
 * Get user profile by ID
 */
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

    if (!data) {
      console.log('No profile found for user:', userId);
      return null;
    }

    return mapProfile(data);
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
}

/**
 * Create a new user profile
 */
export async function createProfile(profile: { id: string; username: string; avatarUrl?: string | null }): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        username: profile.username,
        avatar_url: profile.avatarUrl
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return null;
    }

    if (!data) {
      console.log('Failed to create profile');
      return null;
    }

    return mapProfile(data);
  } catch (error) {
    console.error('Unexpected error creating profile:', error);
    return null;
  }
}

/**
 * Update a user profile
 */
export async function updateProfile(userId: string, updates: Partial<User>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: updates.username,
        avatar_url: updates.avatarUrl
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    if (!data) {
      console.log('Failed to update profile');
      return null;
    }

    return mapProfile(data);
  } catch (error) {
    console.error('Unexpected error updating profile:', error);
    return null;
  }
}

/**
 * Map database fields to frontend model fields
 */
function mapProfile(data: any): User {
  return {
    id: data.id,
    username: data.username,
    avatarUrl: data.avatar_url,
    memeStreak: data.meme_streak,
    wins: data.wins,
    losses: data.losses,
    level: data.level,
    xp: data.xp,
    createdAt: new Date(data.created_at)
  };
}


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
    // First check if profile already exists to avoid duplicates
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.id)
      .single();
      
    if (existingProfile) {
      console.log('Profile already exists, returning existing profile');
      return mapProfile(existingProfile);
    }
    
    // Check if username is already taken
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', profile.username)
      .single();
    
    // If username exists, make it unique by adding random numbers
    let finalUsername = profile.username;
    if (existingUsername) {
      finalUsername = `${profile.username}_${Math.floor(Math.random() * 10000)}`;
      console.log('Username already taken, using:', finalUsername);
    }

    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: profile.id,
        username: finalUsername,
        avatar_url: profile.avatarUrl,
        meme_streak: 0,
        wins: 0,
        losses: 0,
        level: 1,
        xp: 0
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
    memeStreak: data.meme_streak || 0,
    wins: data.wins || 0,
    losses: data.losses || 0,
    level: data.level || 1,
    xp: data.xp || 0,
    createdAt: new Date(data.created_at)
  };
}

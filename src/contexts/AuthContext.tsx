
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { User as UserType } from '@/lib/types';
import { createProfile, getProfile, updateProfile } from '@/lib/database';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserType | null;
  userProfile: UserType | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{error?: {message: string}}>;
  signUp: (email: string, password: string, username: string) => Promise<{error?: {message: string}}>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserType>) => Promise<UserType | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const session = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    session();

    supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const profile = await getProfile(userId);
    setUserProfile(profile);
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign-in error:', error);
        toast.error('Failed to sign in', { description: error.message });
        return { error };
      }
      return { error: undefined };
    } catch (error: any) {
      console.error('Unexpected sign-in error:', error);
      return { error: { message: error.message || 'An unexpected error occurred' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        console.error('Sign-up error:', error);
        toast.error('Failed to sign up', { description: error.message });
        return { error };
      } else {
        // Create user profile
        if (data.user?.id) {
          const newProfile: Partial<UserType> = {
            id: data.user.id,
            username: username,
            avatarUrl: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`,
            memeStreak: 0,
            wins: 0,
            losses: 0,
            level: 1,
            xp: 0,
            createdAt: new Date(),
          };

          const profile = await createProfile(newProfile);
          if (profile) {
            setUserProfile(profile);
            toast.success('Profile created successfully!');
          } else {
            toast.error('Failed to create profile');
          }
        }
        return { error: undefined };
      }
    } catch (error: any) {
      console.error('Unexpected sign-up error:', error);
      return { error: { message: error.message || 'An unexpected error occurred' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign-out error:', error);
        toast.error('Failed to sign out', { description: error.message });
      } else {
        setUser(null);
        setUserProfile(null);
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<UserType>): Promise<UserType | null> => {
    if (!user?.id) {
      console.error('No user ID found, cannot update profile.');
      return null;
    }

    try {
      const updatedProfile = await updateProfile(user.id, updates);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
        return updatedProfile;
      } else {
        toast.error('Failed to update profile');
        return null;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An unexpected error occurred');
      return null;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

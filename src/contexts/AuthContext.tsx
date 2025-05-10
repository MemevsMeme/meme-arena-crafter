
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createProfile, getProfile, updateProfile } from '@/lib/database';
import { User as UserProfile } from '@/lib/types';
import { toast } from 'sonner';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const profile = await getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setUserProfile(null);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const setData = async () => {
      try {
        console.log('Checking for existing session');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        } else {
          console.log('Session found:', session ? 'Yes' : 'No');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error("Error getting session:", error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    try {
      console.log('Setting up auth state listener');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          console.log('Auth state changed:', _event);
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      setData();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
      return () => {};
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('SignIn: Attempting to sign in with email');
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: { message: "An unexpected error occurred" } };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('SignUp: Attempting to create new account');
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      // If signup is successful, create a profile in the profiles table
      if (!error && data?.user) {
        // Generate a default avatar using DiceBear
        const avatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${username}`;
        
        await createProfile({
          id: data.user.id,
          username,
          avatarUrl,
          memeStreak: 0,
          wins: 0,
          losses: 0,
          level: 1,
          xp: 0,
          createdAt: new Date(),
        });
      }
      
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      return { error: { message: "An unexpected error occurred" } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return null;
    
    try {
      const updatedProfile = await updateProfile(user.id, updates);
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      return null;
    }
  };

  const value = {
    session,
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

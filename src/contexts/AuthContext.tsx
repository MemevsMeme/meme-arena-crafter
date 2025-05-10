
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
  const [supabaseConnected, setSupabaseConnected] = useState(true);

  // Check if we're in demo mode
  useEffect(() => {
    const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (isDemoMode) {
      setSupabaseConnected(false);
      setLoading(false);
      toast.error(
        "Supabase connection not configured", 
        { 
          description: "Connect to Supabase in your Lovable project to enable authentication.",
          duration: 6000,
        }
      );
    }
  }, []);

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

    if (supabaseConnected) {
      fetchProfile();
    }
  }, [user, supabaseConnected]);

  useEffect(() => {
    if (!supabaseConnected) return;

    const setData = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error(error);
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
    let subscription: { data: { subscription: { unsubscribe: () => void } } };
    
    try {
      subscription = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      );

      setData();

      return () => {
        subscription?.data?.subscription?.unsubscribe();
      };
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      setLoading(false);
      return () => {};
    }
  }, [supabaseConnected]);

  const signIn = async (email: string, password: string) => {
    if (!supabaseConnected) {
      toast.error("Authentication unavailable", { description: "Supabase is not connected." });
      return { error: { message: "Supabase not connected" } };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      console.error("Sign in error:", error);
      return { error: { message: "An unexpected error occurred" } };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    if (!supabaseConnected) {
      toast.error("Authentication unavailable", { description: "Supabase is not connected." });
      return { error: { message: "Supabase not connected" } };
    }

    try {
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
    if (supabaseConnected) {
      await supabase.auth.signOut();
    } else {
      toast.error("Authentication unavailable", { description: "Supabase is not connected." });
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !supabaseConnected) return null;
    
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

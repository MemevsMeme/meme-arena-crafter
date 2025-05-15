
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { User } from '@/lib/types';
import { getProfile, updateProfile, createProfile } from '@/lib/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  userLoading: boolean;
  updateUserProfile: (updates: any) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, !!newSession);
        setSession(newSession);
        
        // Clear user when signing out
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Then get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session:', !!initialSession);
      setSession(initialSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile when session changes
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user) {
        setUserLoading(true);
        try {
          const profileData = await getProfile(session.user.id);
          
          if (profileData) {
            console.log('Profile data found:', profileData);
            setUser(profileData as User);
          } else {
            console.log('No profile found, creating one');
            // If no profile exists yet, create one with default values
            const newUser = await createProfile({
              id: session.user.id,
              username: session.user.email?.split('@')[0] || `user_${session.user.id.substring(0, 8)}`,
              avatarUrl: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${session.user.id}`
            });
            
            if (newUser) {
              setUser(newUser as User);
            } else {
              console.error('Failed to create new user profile');
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setUserLoading(false);
        }
      } else {
        setUser(null);
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [session]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        console.error('Sign in error:', error);
      } else {
        console.log('Sign in successful');
      }
      return { error };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Attempting sign up for:', email);
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
        console.error('Sign up error:', error);
      } else {
        console.log('Sign up successful');
      }
      return { data, error };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
    console.log('Sign out completed');
  };

  const updateUserProfile = async (updates: any) => {
    if (!user?.id) return null;
    
    try {
      console.log('Updating profile for user:', user.id);
      const updatedProfile = await updateProfile(user.id, updates);
      if (updatedProfile) {
        setUser(updatedProfile as User);
        return updatedProfile as User;
      }
      return null;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  };

  const value = {
    user,
    session,
    signIn,
    signUp,
    signOut,
    loading,
    userLoading,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

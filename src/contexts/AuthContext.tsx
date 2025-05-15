
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as AuthUser } from '@supabase/supabase-js';
import { User } from '@/lib/types';
import { getProfile, createProfile, updateProfile } from '@/lib/database';

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

  // Set up authentication
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);
      
      // Clear user when signing out
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log('Initial session check:', !!initialSession);
      setSession(initialSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch user profile when session changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user) {
        setUser(null);
        setUserLoading(false);
        return;
      }
      
      setUserLoading(true);
      try {
        console.log('Fetching profile for user ID:', session.user.id);
        const profileData = await getProfile(session.user.id);
        
        if (profileData) {
          console.log('Profile found:', profileData.username);
          setUser(profileData as User);
        } else {
          console.log('No profile found, creating one');
          // Create a new profile with default values
          const username = session.user.email?.split('@')[0] || `user_${session.user.id.substring(0, 8)}`;
          const newUser = await createProfile({
            id: session.user.id,
            username,
            avatarUrl: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${session.user.id}`
          });
          
          if (newUser) {
            console.log('New profile created:', newUser.username);
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
    };

    // Use setTimeout to avoid potential deadlocks with auth state changes
    if (session?.user) {
      setTimeout(fetchUser, 0);
    } else {
      setUserLoading(false);
    }
  }, [session]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in for:', email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
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
          data: { username },
        },
      });
      return { data, error };
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    console.log('Signing out...');
    await supabase.auth.signOut();
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

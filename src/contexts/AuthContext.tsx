
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        // Clear user when signing out
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
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
        const profileData = await getProfile(session.user.id);
        
        if (profileData) {
          setUser(profileData as User);
        } else {
          // If no profile exists yet, create one with default values
          const newUser = await createProfile({
            id: session.user.id,
            username: session.user.email?.split('@')[0] || `user_${session.user.id.substring(0, 8)}`,
            avatarUrl: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${session.user.id}`
          });
          
          if (newUser) {
            setUser(newUser as User);
          }
        }
        setUserLoading(false);
      } else {
        setUser(null);
        setUserLoading(false);
      }
    };

    fetchUser();
  }, [session]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
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
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUserProfile = async (updates: any) => {
    if (!user?.id) return null;
    
    const updatedProfile = await updateProfile(user.id, updates);
    if (updatedProfile) {
      setUser(updatedProfile as User);
    }
    return updatedProfile as User | null;
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

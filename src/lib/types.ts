
export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  memeStreak: number;
  wins: number;
  losses: number;
  level: number;
  xp: number;
  createdAt: Date;
}

export interface Meme {
  id: string;
  prompt: string;
  prompt_id?: string; // Changed from promptId to prompt_id to match database schema
  imageUrl: string;
  ipfsCid: string;
  caption: string;
  creatorId: string;
  creator?: User;
  votes: number;
  createdAt: Date;
  tags: string[];
}

export interface Prompt {
  id: string;
  text: string;
  theme: string;
  tags: string[];
  active: boolean;
  startDate: Date;
  endDate: Date;
}

export interface Battle {
  id: string;
  promptId: string;
  prompt?: Prompt;
  memeOneId: string;
  memeTwoId: string;
  memeOne?: Meme;
  memeTwo?: Meme;
  winnerId?: string;
  voteCount: number;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Vote {
  id: string;
  userId: string;
  battleId: string;
  memeId: string;
  createdAt: Date;
}

export interface Caption {
  text: string;
  style: 'funny' | 'dark' | 'wholesome' | 'sarcastic';
  confidence: number;
}

// Temporary Database Types for improved TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          meme_streak: number;
          wins: number;
          losses: number;
          level: number;
          xp: number;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          meme_streak?: number;
          wins?: number;
          losses?: number;
          level?: number;
          xp?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          avatar_url?: string | null;
          meme_streak?: number;
          wins?: number;
          losses?: number;
          level?: number;
          xp?: number;
          created_at?: string;
        };
      };
      memes: {
        Row: {
          id: string;
          prompt: string | null;
          prompt_id: string | null;
          image_url: string;
          ipfs_cid: string | null;
          caption: string;
          creator_id: string;
          votes: number;
          created_at: string;
          tags: string[];
        };
        Insert: {
          id?: string;
          prompt?: string | null;
          prompt_id?: string | null;
          image_url: string;
          ipfs_cid?: string | null;
          caption: string;
          creator_id: string;
          votes?: number;
          created_at?: string;
          tags?: string[];
        };
        Update: {
          id?: string;
          prompt?: string | null;
          prompt_id?: string | null;
          image_url?: string;
          ipfs_cid?: string | null;
          caption?: string;
          creator_id?: string;
          votes?: number;
          created_at?: string;
          tags?: string[];
        };
      };
      prompts: {
        Row: {
          id: string;
          text: string;
          theme: string | null;
          tags: string[];
          active: boolean;
          start_date: string;
          end_date: string;
        };
        Insert: {
          id?: string;
          text: string;
          theme?: string | null;
          tags?: string[];
          active?: boolean;
          start_date?: string;
          end_date?: string;
        };
        Update: {
          id?: string;
          text?: string;
          theme?: string | null;
          tags?: string[];
          active?: boolean;
          start_date?: string;
          end_date?: string;
        };
      };
      battles: {
        Row: {
          id: string;
          prompt_id: string | null;
          meme_one_id: string;
          meme_two_id: string;
          winner_id: string | null;
          vote_count: number;
          start_time: string;
          end_time: string;
          status: 'active' | 'completed' | 'cancelled';
        };
        Insert: {
          id?: string;
          prompt_id?: string | null;
          meme_one_id: string;
          meme_two_id: string;
          winner_id?: string | null;
          vote_count?: number;
          start_time?: string;
          end_time?: string;
          status?: 'active' | 'completed' | 'cancelled';
        };
        Update: {
          id?: string;
          prompt_id?: string | null;
          meme_one_id?: string;
          meme_two_id?: string;
          winner_id?: string | null;
          vote_count?: number;
          start_time?: string;
          end_time?: string;
          status?: 'active' | 'completed' | 'cancelled';
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          battle_id: string;
          meme_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          battle_id: string;
          meme_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          battle_id?: string;
          meme_id?: string;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};

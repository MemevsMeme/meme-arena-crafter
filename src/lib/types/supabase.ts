
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
          battle_id: string | null;
          is_battle_submission: boolean;
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
          battle_id?: string | null;
          is_battle_submission?: boolean;
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
          battle_id?: string | null;
          is_battle_submission?: boolean;
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
          creator_id: string | null;
          is_community: boolean;
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
          creator_id?: string | null;
          is_community?: boolean;
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
          status?: string;
          creator_id?: string | null;
          is_community?: boolean;
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
          description: string | null;
          creator_id: string | null;
          is_community: boolean;
          daily_challenge_id: string | null;
        };
        Insert: {
          id?: string;
          text: string;
          theme?: string | null;
          tags?: string[];
          active?: boolean;
          start_date?: string;
          end_date?: string;
          description?: string | null;
          creator_id?: string | null;
          is_community?: boolean;
          daily_challenge_id?: string | null;
        };
        Update: {
          id?: string;
          text?: string;
          theme?: string | null;
          tags?: string[];
          active?: boolean;
          start_date?: string;
          end_date?: string;
          description?: string | null;
          creator_id?: string | null;
          is_community?: boolean;
          daily_challenge_id?: string | null;
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
  };
};

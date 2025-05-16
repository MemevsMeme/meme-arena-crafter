
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
      };
    };
  };
};

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      battles: {
        Row: {
          creator_id: string | null
          end_time: string
          id: string
          is_community: boolean | null
          meme_one_id: string
          meme_two_id: string
          prompt_id: string | null
          start_time: string
          status: string
          vote_count: number
          winner_id: string | null
        }
        Insert: {
          creator_id?: string | null
          end_time?: string
          id?: string
          is_community?: boolean | null
          meme_one_id: string
          meme_two_id: string
          prompt_id?: string | null
          start_time?: string
          status?: string
          vote_count?: number
          winner_id?: string | null
        }
        Update: {
          creator_id?: string | null
          end_time?: string
          id?: string
          is_community?: boolean | null
          meme_one_id?: string
          meme_two_id?: string
          prompt_id?: string | null
          start_time?: string
          status?: string
          vote_count?: number
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "battles_meme_one_id_fkey"
            columns: ["meme_one_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battles_meme_two_id_fkey"
            columns: ["meme_two_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battles_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "battles_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          created_at: string | null
          day_of_year: number
          id: string
          tags: string[] | null
          text: string
          theme: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_year: number
          id?: string
          tags?: string[] | null
          text: string
          theme?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_year?: number
          id?: string
          tags?: string[] | null
          text?: string
          theme?: string | null
        }
        Relationships: []
      }
      memes: {
        Row: {
          battle_id: string | null
          caption: string
          challenge_day: number | null
          created_at: string
          creator_id: string
          id: string
          image_url: string
          ipfs_cid: string | null
          is_battle_submission: boolean | null
          prompt: string | null
          prompt_id: string | null
          tags: string[]
          votes: number
        }
        Insert: {
          battle_id?: string | null
          caption: string
          challenge_day?: number | null
          created_at?: string
          creator_id: string
          id?: string
          image_url: string
          ipfs_cid?: string | null
          is_battle_submission?: boolean | null
          prompt?: string | null
          prompt_id?: string | null
          tags?: string[]
          votes?: number
        }
        Update: {
          battle_id?: string | null
          caption?: string
          challenge_day?: number | null
          created_at?: string
          creator_id?: string
          id?: string
          image_url?: string
          ipfs_cid?: string | null
          is_battle_submission?: boolean | null
          prompt?: string | null
          prompt_id?: string | null
          tags?: string[]
          votes?: number
        }
        Relationships: [
          {
            foreignKeyName: "memes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memes_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          level: number
          losses: number
          meme_streak: number
          username: string
          wins: number
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          level?: number
          losses?: number
          meme_streak?: number
          username: string
          wins?: number
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          level?: number
          losses?: number
          meme_streak?: number
          username?: string
          wins?: number
          xp?: number
        }
        Relationships: []
      }
      prompts: {
        Row: {
          active: boolean
          creator_id: string | null
          daily_challenge_id: string | null
          description: string | null
          end_date: string
          id: string
          is_community: boolean | null
          start_date: string
          tags: string[]
          text: string
          theme: string | null
        }
        Insert: {
          active?: boolean
          creator_id?: string | null
          daily_challenge_id?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_community?: boolean | null
          start_date?: string
          tags?: string[]
          text: string
          theme?: string | null
        }
        Update: {
          active?: boolean
          creator_id?: string | null
          daily_challenge_id?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_community?: boolean | null
          start_date?: string
          tags?: string[]
          text?: string
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompts_daily_challenge_id_fkey"
            columns: ["daily_challenge_id"]
            isOneToOne: false
            referencedRelation: "daily_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          battle_id: string
          created_at: string
          id: string
          meme_id: string
          user_id: string
        }
        Insert: {
          battle_id: string
          created_at?: string
          id?: string
          meme_id: string
          user_id: string
        }
        Update: {
          battle_id?: string
          created_at?: string
          id?: string
          meme_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_battle_id_fkey"
            columns: ["battle_id"]
            isOneToOne: false
            referencedRelation: "battles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "votes_meme_id_fkey"
            columns: ["meme_id"]
            isOneToOne: false
            referencedRelation: "memes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const


// Re-export types from the main types file
export * from '../types';

// Add RPC parameter types to fix type errors with Supabase RPC calls
export interface RpcParams {
  increment_meme_votes: {
    p_meme_id: string;
  };
  increment_battle_votes: {
    p_battle_id: string;
  };
  // Add other RPC function parameter types here as needed
}

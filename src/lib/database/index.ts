
// Re-export all database functions
export * from './client';
export * from './memes';
export * from './battles';
export * from './dailyChallenges';
// Export votes but explicitly re-export incrementBattleVote to avoid name conflicts
export * from './votes';


// Re-export all database functions
export * from './client';
export * from './memes';
export * from './battles';
export * from './dailyChallenges';
// Export votes without the incrementBattleVote function to avoid conflicts
// We'll use the one from battles.ts
export { castVote, hasUserVotedInBattle, getBattleVotes } from './votes';


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

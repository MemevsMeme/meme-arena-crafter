
export interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  memeStreak: number;
  wins: number;
  losses: number;
  level: number;
  xp: number;
  createdAt: Date;
}

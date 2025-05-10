
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

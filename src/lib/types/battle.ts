
import { Meme } from './meme';
import { Prompt } from './prompt';

export interface Battle {
  id: string;
  promptId: string;
  prompt?: Prompt;
  memeOneId: string;
  memeTwoId: string;
  meme_one_id?: string; // Database field
  meme_two_id?: string; // Database field
  memeOne?: Meme;
  memeTwo?: Meme;
  winnerId?: string;
  voteCount: number;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'completed' | 'cancelled';
  is_community?: boolean;
  creator_id?: string; // Database field
  votes_a?: number; // Database field
  votes_b?: number; // Database field
  submissions?: Meme[];
  createdAt: Date;
}

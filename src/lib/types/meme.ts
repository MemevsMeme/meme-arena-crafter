
import { User } from './user';

export interface Meme {
  id: string;
  prompt: string;
  prompt_id?: string; 
  imageUrl: string;
  ipfsCid: string;
  caption: string;
  creatorId: string;
  creator?: User;
  votes: number;
  createdAt: Date;
  tags: string[];
  isBattleSubmission?: boolean;
  battleId?: string;
  challengeDay?: number;
}

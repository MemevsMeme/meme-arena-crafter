
export interface Prompt {
  id: string;
  text: string;
  theme: string | null;
  tags: string[];
  active: boolean;
  startDate: Date;
  endDate: Date;
  description?: string;
  creator_id?: string;
  is_community?: boolean;
  daily_challenge_id?: string;
  challengeDay?: number;
}

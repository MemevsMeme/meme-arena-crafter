
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Battle, Meme, Prompt } from '@/lib/types';
import MemeCard from '@/components/meme/MemeCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award, Clock, ThumbsUp, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getMemeById } from '@/lib/database/memes';
import { hasUserVotedInBattle } from '@/lib/database/votes';

interface BattleViewProps {
  battle: Battle;
  onVote?: (memeId: string) => Promise<void>;
  isLoggedIn: boolean;
  userId?: string;
  showActions?: boolean;
  loading?: boolean;
  onBackClick?: () => void;
}

const BattleView: React.FC<BattleViewProps> = ({
  battle,
  onVote,
  isLoggedIn,
  userId,
  showActions = true,
  loading = false,
  onBackClick
}) => {
  const [memeOne, setMemeOne] = useState<Meme | null>(null);
  const [memeTwo, setMemeTwo] = useState<Meme | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voting, setVoting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    const fetchMemeData = async () => {
      if (battle.memeOneId) {
        const memeData = await getMemeById(battle.memeOneId);
        setMemeOne(memeData);
      }
      
      if (battle.memeTwoId) {
        const memeData = await getMemeById(battle.memeTwoId);
        setMemeTwo(memeData);
      }
      
      // Check if user has voted in this battle
      if (isLoggedIn && userId) {
        const voted = await hasUserVotedInBattle(userId, battle.id);
        setHasVoted(voted);
      }
    };
    
    fetchMemeData();
  }, [battle, isLoggedIn, userId]);
  
  // Update time left
  useEffect(() => {
    if (!battle) return;
    
    const updateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(battle.endTime);
      
      if (now >= endTime) {
        setTimeLeft('Battle ended');
        return;
      }
      
      setTimeLeft(formatDistanceToNow(endTime, { addSuffix: true }));
    };
    
    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [battle]);
  
  const handleVote = async (memeId: string) => {
    if (!isLoggedIn || hasVoted || voting || !onVote) return;
    
    setVoting(true);
    try {
      await onVote(memeId);
      setHasVoted(true);
    } finally {
      setVoting(false);
    }
  };
  
  const isActive = battle?.status === 'active';
  const isCompleted = battle?.status === 'completed';
  const winnerMeme = battle?.winnerId ? (battle.winnerId === battle.memeOneId ? memeOne : memeTwo) : null;
  
  // Helper function to extract prompt text safely
  const getPromptText = (prompt: string | Prompt | undefined): string => {
    if (!prompt) return '';
    if (typeof prompt === 'string') return prompt;
    return prompt.text || '';
  };
  
  return (
    <div>
      {onBackClick && (
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={onBackClick}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Battles
        </Button>
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-heading">Meme Battle</h1>
        {battle.prompt && (
          <p className="text-xl mt-2 text-muted-foreground">"{getPromptText(battle.prompt)}"</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></span>
              <span>{isActive ? 'Active' : 'Completed'}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{timeLeft}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <ThumbsUp className="mr-2 h-5 w-5" />
              Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{battle?.voteCount || 0}</p>
            <p className="text-sm text-muted-foreground">Total votes cast</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Winner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isCompleted && winnerMeme ? (
              <div className="flex items-center">
                {winnerMeme.creator && (
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img 
                        src={winnerMeme.creator.avatarUrl || 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=default'} 
                        alt={winnerMeme.creator.username}
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <span className="ml-2">{winnerMeme.creator.username || 'Unknown'}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Not determined yet</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {memeOne && (
          <div>
            <MemeCard 
              meme={memeOne} 
              showActions={isActive && !hasVoted && isLoggedIn && showActions}
              onVote={() => handleVote(memeOne.id)}
              votingDisabled={voting}
              showVoteCount={true}
              voteCount={battle.votes_a || 0}
              inBattle={true}
              isWinner={isCompleted && battle.winnerId === memeOne.id}
            />
          </div>
        )}
        
        {memeTwo && (
          <div>
            <MemeCard 
              meme={memeTwo} 
              showActions={isActive && !hasVoted && isLoggedIn && showActions}
              onVote={() => handleVote(memeTwo.id)}
              votingDisabled={voting}
              showVoteCount={true}
              voteCount={battle.votes_b || 0}
              inBattle={true}
              isWinner={isCompleted && battle.winnerId === memeTwo.id}
            />
          </div>
        )}
      </div>
      
      {!isLoggedIn && isActive && showActions && (
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p>You need to be logged in to vote in this battle.</p>
          <Button 
            className="mt-2"
            asChild
          >
            <Link to="/login">Log In to Vote</Link>
          </Button>
        </div>
      )}
      
      {hasVoted && isActive && (
        <div className="mt-8 p-4 bg-muted rounded-lg text-center">
          <p>Thanks for voting! Check back later to see the results.</p>
        </div>
      )}
    </div>
  );
};

export default BattleView;

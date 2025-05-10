
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserAvatar from '@/components/ui/UserAvatar';
import { Heart, MessageSquare, Share, Award } from 'lucide-react';
import { Meme, User } from '@/lib/types';
import { MOCK_USERS } from '@/lib/constants';

interface MemeCardProps {
  meme: Meme;
  showActions?: boolean;
  inBattle?: boolean;
  isWinner?: boolean;
  onVote?: () => void;
  onShare?: () => void;
}

const MemeCard = ({
  meme,
  showActions = true,
  inBattle = false,
  isWinner = false,
  onVote,
  onShare
}: MemeCardProps) => {
  const [isVoted, setIsVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(meme.votes);
  
  // Find creator from mock data
  const creator: User = MOCK_USERS.find(user => user.id === meme.creatorId) || MOCK_USERS[0];

  const handleVote = () => {
    if (onVote) {
      onVote();
      return;
    }
    
    if (!isVoted) {
      setVoteCount(prev => prev + 1);
      setIsVoted(true);
    } else {
      setVoteCount(prev => prev - 1);
      setIsVoted(false);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare();
      return;
    }
    
    // Just mock share functionality
    alert('Share URL copied to clipboard!');
  };

  return (
    <div className={`meme-card shadow-md ${inBattle ? 'border-4' : 'border'} ${isWinner ? 'border-brand-orange' : 'border-border'}`}>
      {isWinner && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-brand-orange text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Award className="h-3 w-3" />
            Winner
          </div>
        </div>
      )}
      
      <div className="p-3 bg-background">
        <div className="flex justify-between items-center">
          <UserAvatar user={creator} showUsername showLevel />
          
          <div className="text-xs text-muted-foreground">
            {new Date(meme.createdAt).toLocaleDateString()}
          </div>
        </div>
        
        <p className="mt-2 text-sm font-medium">
          {meme.prompt}
        </p>
      </div>
      
      <Link to={`/meme/${meme.id}`}>
        <div className="relative bg-muted aspect-square overflow-hidden">
          <img
            src={meme.imageUrl}
            alt={meme.caption}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white font-medium text-center whitespace-pre-line">
              {meme.caption}
            </p>
          </div>
        </div>
      </Link>
      
      {showActions && (
        <div className="p-3 bg-background flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 ${isVoted ? 'text-brand-orange' : ''}`}
              onClick={handleVote}
            >
              <Heart className={`h-4 w-4 ${isVoted ? 'fill-brand-orange' : ''}`} />
              <span>{voteCount}</span>
            </Button>
            
            <Link to={`/meme/${meme.id}`}>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{Math.floor(Math.random() * 10)}</span>
              </Button>
            </Link>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MemeCard;
